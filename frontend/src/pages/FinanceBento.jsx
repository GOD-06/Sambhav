import FinanceBentoDemo from '../components/ui/demo';

/**
 * Full-bleed preview of the shadcn/ui Finance Bento component.
 * The demo ships with its own black canvas, so we cancel the layout padding.
 */
export default function FinanceBento() {
  return (
    <div className="-m-6 min-h-full bg-black">
      <FinanceBentoDemo />
    </div>
  );
}
