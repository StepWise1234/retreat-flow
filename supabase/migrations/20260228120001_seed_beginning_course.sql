DO $$
DECLARE
  v_course_id uuid;
  v_module_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'beginning';

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Foundations', 'Introduction to StepWise methodology and foundational principles', 1, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Welcome to StepWise', NULL, 6, 1, true),
    (v_module_id, 'What is StepWise?', NULL, 12, 2, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'The Satisfying Breath', 'The power of using the breath to down regulate the nervous system, and create a glide path for StepWise sessions', 2, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Introduction to Satisfying Breath', NULL, 6, 1, true),
    (v_module_id, 'Satisfying Breath Meditation', NULL, 13, 2, true),
    (v_module_id, 'Guiding the Satisfying Breath', NULL, 12, 3, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Neurobiology', 'The science of consciousness, nervous system regulation, and neuroplasticity', 3, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Brain Anatomy Basics', NULL, NULL, 1, false),
    (v_module_id, 'The Default Mode Network', NULL, NULL, 2, false),
    (v_module_id, 'Serotonin and 5-HT2A Receptors', NULL, NULL, 3, false),
    (v_module_id, 'The Autonomic Nervous System', NULL, NULL, 4, false),
    (v_module_id, 'Polyvagal Theory', NULL, NULL, 5, false),
    (v_module_id, 'Window of Tolerance', NULL, NULL, 6, false),
    (v_module_id, 'Neuroplasticity and Healing', NULL, NULL, 7, false),
    (v_module_id, 'The Limbic System', NULL, NULL, 8, false),
    (v_module_id, 'Embodied Cognition', NULL, NULL, 9, false),
    (v_module_id, 'States vs Traits', NULL, NULL, 10, false),
    (v_module_id, 'The Nervous System', NULL, 9, 11, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Relational Container', 'Building trust, presence, and therapeutic relationship', 4, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Foundations of Therapeutic Presence', NULL, NULL, 1, false),
    (v_module_id, 'Building Trust and Rapport', NULL, NULL, 2, false),
    (v_module_id, 'Somatic Attunement', NULL, NULL, 3, false),
    (v_module_id, 'Co-Regulation Skills', NULL, NULL, 4, false),
    (v_module_id, 'Setting Boundaries', NULL, NULL, 5, false),
    (v_module_id, 'Cultural Humility', NULL, NULL, 6, false),
    (v_module_id, 'Non-Directive Facilitation', NULL, NULL, 7, false),
    (v_module_id, 'The Power of Witnessing', NULL, NULL, 8, false),
    (v_module_id, 'The Relational Container', NULL, 5, 9, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'The Parts Within', 'Guest Teacher, Janusz, shares parts work for you and your clients', 5, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Introduction to Parts Work', NULL, 13, 1, false),
    (v_module_id, 'Introduction to Parts Work', NULL, 13, 2, true),
    (v_module_id, 'Meditation: A Part Of Me Feels', NULL, 11, 3, true),
    (v_module_id, 'Meditation: Parts/Whole', NULL, 11, 4, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'The Molecule & Pharmacology', 'Understanding 5-MeO-DMT: chemistry, effects, and mechanisms', 6, false)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Introduction to 5-MeO-DMT', NULL, NULL, 1, false),
    (v_module_id, 'Sources and Forms', NULL, NULL, 2, false),
    (v_module_id, 'Pharmacokinetics', NULL, NULL, 3, false),
    (v_module_id, 'Dosing Principles', NULL, NULL, 4, false),
    (v_module_id, 'Duration and Timeline', NULL, NULL, 5, false),
    (v_module_id, 'Current Research', NULL, NULL, 6, false);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Risk Assessment', 'Medical screening, contraindications, and safety protocols', 7, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Medical Screening Essentials', NULL, 3, 1, true),
    (v_module_id, 'Pharmacodynamics Basics', NULL, 4, 2, true),
    (v_module_id, 'Contraindications', NULL, 4, 3, true),
    (v_module_id, 'Serotonin Toxicity', NULL, 2, 4, true),
    (v_module_id, 'Medical Contraindications', NULL, 2, 5, true),
    (v_module_id, 'Mental Health Contraindications', NULL, 3, 6, true),
    (v_module_id, 'Adverse Reaction Statistics', NULL, 3, 7, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Client Preparation & Assessment', 'Intake processes, intention setting, and readiness evaluation', 8, false)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Initial Intake Process', NULL, NULL, 1, false),
    (v_module_id, 'Assessing Readiness', NULL, NULL, 2, false),
    (v_module_id, 'Setting Intentions', NULL, NULL, 3, false),
    (v_module_id, 'Preparation Practices', NULL, NULL, 4, false),
    (v_module_id, 'Education and Expectation Setting', NULL, NULL, 5, false),
    (v_module_id, 'Creating Support Structures', NULL, NULL, 6, false),
    (v_module_id, 'When to Say No', NULL, NULL, 7, false);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Working with Trauma', 'Trauma-informed approaches, somatic awareness, and healing modalities', 9, false)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Understanding Trauma', NULL, NULL, 1, false),
    (v_module_id, 'Trauma-Informed Principles', NULL, NULL, 2, false),
    (v_module_id, 'Recognizing Trauma Responses', NULL, NULL, 3, false),
    (v_module_id, 'Somatic Experiencing', NULL, NULL, 4, false),
    (v_module_id, 'Preventing Re-Traumatization', NULL, NULL, 5, false),
    (v_module_id, 'Working with Dissociation', NULL, NULL, 6, false),
    (v_module_id, 'Attachment and Developmental Trauma', NULL, NULL, 7, false),
    (v_module_id, 'Supporting Trauma Integration', NULL, NULL, 8, false),
    (v_module_id, 'Your Own Trauma Work', NULL, NULL, 9, false);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'The StepWise Session', 'The art of tracking, dosing strategies, and moment-to-moment guidance', 10, true)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'The Art of Titration', NULL, NULL, 1, false),
    (v_module_id, 'Tracking Consciousness', NULL, NULL, 2, false),
    (v_module_id, 'Set and Setting', NULL, NULL, 3, false),
    (v_module_id, 'Administration Techniques', NULL, NULL, 4, false),
    (v_module_id, 'Verbal Interventions', NULL, NULL, 5, false),
    (v_module_id, 'Touch and Physical Support', NULL, NULL, 6, false),
    (v_module_id, 'Managing Intensity', NULL, NULL, 7, false),
    (v_module_id, 'The Descent and Return', NULL, NULL, 8, false),
    (v_module_id, 'Multi-Session Protocols', NULL, NULL, 9, false),
    (v_module_id, 'Case Studies', NULL, NULL, 10, false),
    (v_module_id, 'The StepWise Approach', NULL, 7, 11, true);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Integration Practices', 'Post-session support, embodiment practices, and long-term transformation', 11, false)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'The Integration Window', NULL, NULL, 1, false),
    (v_module_id, 'Immediate Post-Session Care', NULL, NULL, 2, false),
    (v_module_id, 'Embodiment Practices', NULL, NULL, 3, false),
    (v_module_id, 'Journaling and Reflection', NULL, NULL, 4, false),
    (v_module_id, 'Creative Expression', NULL, NULL, 5, false),
    (v_module_id, 'Lifestyle Changes', NULL, NULL, 6, false),
    (v_module_id, 'Ongoing Support Models', NULL, NULL, 7, false),
    (v_module_id, 'Measuring Transformation', NULL, NULL, 8, false);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Professional Development & Ethics', 'Practitioner self-care, ethical boundaries, and community standards', 12, false)
  RETURNING id INTO v_module_id;
  INSERT INTO public.course_lessons (module_id, title, vimeo_id, duration_minutes, sort_order, is_published) VALUES
    (v_module_id, 'Practitioner Self-Care', NULL, NULL, 1, false),
    (v_module_id, 'Ethical Frameworks', NULL, NULL, 2, false),
    (v_module_id, 'Power Dynamics and Transference', NULL, NULL, 3, false),
    (v_module_id, 'Legal and Regulatory Landscape', NULL, NULL, 4, false),
    (v_module_id, 'Building Your Practice', NULL, NULL, 5, false),
    (v_module_id, 'Community and Ongoing Learning', NULL, NULL, 6, false);

  INSERT INTO public.course_modules (course_id, title, description, sort_order, is_published)
  VALUES (v_course_id, 'Integration', 'The process of integrating altered states into real changes in daily life', 13, false)
  RETURNING id INTO v_module_id;

END $$;
