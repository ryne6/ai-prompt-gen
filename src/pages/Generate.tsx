import { InputSection } from '../components/InputSection';
import { ResultSection } from '../components/ResultSection';
import { HistorySection } from '../components/HistorySection';

export default function GeneratePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <InputSection />
      <ResultSection />
      <HistorySection />
    </div>
  );
}


