import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Room {
  id: string;
  training_id: string;
  name: string;
  description: string | null;
  bed_type: string | null;
  bath_type: string | null;
  image_url: string | null;
  price_adjustment_cents: number;
  is_premier: boolean;
  sort_order: number;
}

export interface RoomReservation {
  id: string;
  room_id: string;
  application_id: string | null;
  user_id: string;
  training_id: string;
  reserved_at: string;
}

export interface RoomWithStatus extends Room {
  status: 'available' | 'reserved' | 'mine';
  reservedBy?: string;
}

export function useAccommodation(trainingId: string | null, userId: string | null, applicationId: string | null) {
  const queryClient = useQueryClient();
  const [reservations, setReservations] = useState<RoomReservation[]>([]);

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', trainingId],
    queryFn: async () => {
      if (!trainingId) return [];
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('training_id', trainingId)
        .order('sort_order');
      if (error) throw error;
      return data as Room[];
    },
    enabled: !!trainingId,
  });

  const { data: initialReservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['room_reservations', trainingId],
    queryFn: async () => {
      if (!trainingId) return [];
      const { data, error } = await supabase
        .from('room_reservations')
        .select('*')
        .eq('training_id', trainingId);
      if (error) throw error;
      return data as RoomReservation[];
    },
    enabled: !!trainingId,
  });

  useEffect(() => {
    if (initialReservations.length > 0 || !reservationsLoading) {
      setReservations(initialReservations);
    }
  }, [initialReservations, reservationsLoading]);

  useEffect(() => {
    if (!trainingId) return;
    const channel = supabase
      .channel('room_reservations_' + trainingId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_reservations', filter: 'training_id=eq.' + trainingId }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReservations(prev => {
            const exists = prev.some(r => r.id === (payload.new as RoomReservation).id);
            if (exists) return prev;
            return [...prev, payload.new as RoomReservation];
          });
        } else if (payload.eventType === 'DELETE') {
          setReservations(prev => prev.filter(r => r.id !== (payload.old as RoomReservation).id));
        } else if (payload.eventType === 'UPDATE') {
          setReservations(prev => prev.map(r => r.id === (payload.new as RoomReservation).id ? payload.new as RoomReservation : r));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [trainingId]);

  const roomsWithStatus: RoomWithStatus[] = rooms.map(room => {
    const reservation = reservations.find(r => r.room_id === room.id);
    let status: 'available' | 'reserved' | 'mine' = 'available';
    if (reservation) {
      status = reservation.user_id === userId ? 'mine' : 'reserved';
    }
    return { ...room, status, reservedBy: reservation?.user_id };
  });

  const myReservation = reservations.find(r => r.user_id === userId);

  const reserveRoom = useMutation({
    mutationFn: async (roomId: string) => {
      if (!userId || !trainingId) throw new Error('Not authenticated');
      if (myReservation) {
        const { error: deleteError } = await supabase.from('room_reservations').delete().eq('user_id', userId).eq('training_id', trainingId);
        if (deleteError) throw deleteError;
      }
      const { data, error } = await supabase.from('room_reservations').insert({ room_id: roomId, user_id: userId, training_id: trainingId, application_id: applicationId }).select().single();
      if (error) {
        if (error.code === '23505') throw new Error('This room has just been reserved by someone else');
        throw error;
      }
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['room_reservations', trainingId] }); toast.success('Room reserved!'); },
    onError: (error: Error) => { toast.error(error.message || 'Failed to reserve room'); queryClient.invalidateQueries({ queryKey: ['room_reservations', trainingId] }); },
  });

  const unreserveRoom = useMutation({
    mutationFn: async () => {
      if (!userId || !trainingId) throw new Error('Not authenticated');
      const { error } = await supabase.from('room_reservations').delete().eq('user_id', userId).eq('training_id', trainingId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['room_reservations', trainingId] }); toast.success('Reservation cancelled'); },
    onError: () => { toast.error('Failed to cancel reservation'); },
  });

  return { rooms: roomsWithStatus, isLoading: roomsLoading || reservationsLoading, myReservation, reserveRoom, unreserveRoom };
}
