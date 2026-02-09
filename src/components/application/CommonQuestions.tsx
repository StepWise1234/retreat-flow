import { motion } from 'framer-motion';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const QUESTIONS = [
  {
    q: 'Can a dramatic catharsis happen without full release?',
    a: 'There is almost no possibility for a dramatic catharsis when starting with a short draw on the lowest pens. Even with repeated draws, the lowest pens offer a warm, rich somatic grounding feeling. Only when the system says "Yes" does the client move to the next step.',
  },
  {
    q: 'What if a client becomes too frightened to continue?',
    a: 'Being afraid to continue beyond the lowest pens is just fine. We say "Fear is safe. Trust everything!" No matter what arrives, it is welcome. Should the client get stuck, that becomes the perfect opportunity to rest and begin developing a relationship with those protective parts.',
  },
  {
    q: 'Can clients self-administer at their own pace?',
    a: 'Self-administering is explicitly encouraged. A lovely aspect of the vape-pen delivery method and the StepWise protocol is that the client is in the driver\'s seat, establishing their own unique relationship with the medicine and their own rhythm.',
  },
  {
    q: 'How do you set expectations for first-timers?',
    a: 'The brilliant reframe of StepWise is that one can gently and deliberately ease into the great expanse while taking sovereign identity awareness along for the ride. It\'s not about the big bang. It\'s about incorporating the visceral gnosis that we are one with That.',
  },
  {
    q: 'Does this strategy affect the nature of release?',
    a: 'Absolutely. The StepWise approach affords the conscious presence of the "me" making the choice to step wisely into an ever increasing awareness, instead of being catapulted beyond control or willingness.',
  },
  {
    q: 'What about the "dreaded underdose"?',
    a: 'This is the realm where one can greet the opportunity to develop a relationship with Surrender — that progressive step beyond egocentricity toward a fuller connection with Being. The struggle of learning to choose another way is the reason we are here.',
  },
];

export default function CommonQuestions() {
  return (
    <section className="relative bg-[#fafafa] overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.12}
        duration={3}
        className="text-neutral-400 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
      />
      <div className="relative mx-auto max-w-2xl px-6 py-24 md:py-32">
        {/* Heading */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-16"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Common Questions
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {QUESTIONS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="border-b border-neutral-200 py-1"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-neutral-900 hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                  <span className="flex items-start gap-4">
                    <span
                      className="shrink-0 mt-0.5 h-2 w-2 rounded-full"
                      style={{ backgroundColor: i % 3 === 0 ? '#FFA500' : i % 3 === 1 ? '#FF4500' : '#800080' }}
                    />
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-base leading-[1.8] text-neutral-500 pl-6 pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
