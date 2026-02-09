import PaceSection from '@/components/application/PaceSection';
import ProblemSection from '@/components/application/ProblemSection';
import FindFacilitatorCTA from '@/components/application/FindFacilitatorCTA';
import TestimonialsCarousel from '@/components/application/TestimonialsCarousel';
import StepWiseOverview from '@/components/application/StepWiseOverview';
import CommonQuestions from '@/components/application/CommonQuestions';
import FloatingLogo from '@/components/application/FloatingLogo';
import SiteFooter from '@/components/application/SiteFooter';

export default function ApplicationForm() {
  return (
    <div className="min-h-screen bg-black">
      <FloatingLogo />
      <PaceSection />
      <ProblemSection />
      <TestimonialsCarousel />
      <StepWiseOverview />
      <FindFacilitatorCTA />
      <CommonQuestions />
      <SiteFooter />
    </div>
  );
}
