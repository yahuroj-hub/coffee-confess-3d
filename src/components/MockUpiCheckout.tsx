import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { confirmMockPayment } from "@/lib/menu.functions";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  totalCents: number;
  onPaid: () => void;
};

const PAYEE = "Yash";
const PRESET_UPI = "yahuroj@okicici";

export function MockUpiCheckout({ open, onClose, orderId, totalCents, onPaid }: Props) {
  const [upi, setUpi] = useState(PRESET_UPI);
  const [stage, setStage] = useState<"enter" | "processing" | "done">("enter");
  const [result, setResult] = useState<"success" | "fail" | null>(null);
  const confirm = useServerFn(confirmMockPayment);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId) return;
    setStage("processing");
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2000));
    // Random 80% success
    const success = Math.random() < 0.8;
    try {
      await confirm({ data: { order_id: orderId, upi_id: upi, success } });
      setResult(success ? "success" : "fail");
      setStage("done");
      if (success) {
        toast.success(`Payment received — ₹${(totalCents / 100).toFixed(2)}`);
        setTimeout(() => { onPaid(); reset(); }, 1800);
      } else {
        toast.error("Payment failed. Try again.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Could not confirm payment");
      setStage("enter");
    }
  }

  function reset() {
    setStage("enter");
    setResult(null);
    setUpi(PRESET_UPI);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={stage === "enter" ? reset : undefined}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden"
          >
            {/* GPay-style header */}
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">G</div>
                  <span className="font-semibold">Mock Pay</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">TEST</span>
              </div>
              <p className="text-xs mt-3 opacity-80">Paying to</p>
              <p className="text-lg font-semibold">{PAYEE}</p>
              <p className="text-3xl font-bold mt-1">₹{(totalCents / 100).toFixed(2)}</p>
            </div>

            {stage === "enter" && (
              <form onSubmit={handlePay} className="p-5 space-y-4">
                <label className="block text-xs font-medium text-slate-500">Pay from UPI ID</label>
                <input
                  required
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="name@bank"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition"
                >
                  Pay ₹{(totalCents / 100).toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Demo mode · no real money is transferred
                </p>
              </form>
            )}

            {stage === "processing" && (
              <div className="p-10 text-center">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="mt-4 text-sm text-slate-600">Connecting to your bank…</p>
              </div>
            )}

            {stage === "done" && result === "success" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-10 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">
                  ✓
                </div>
                <p className="mt-4 font-semibold text-green-700">Payment successful</p>
                <p className="text-xs text-slate-500 mt-1">Your coffee is being prepared</p>
              </motion.div>
            )}

            {stage === "done" && result === "fail" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl">
                  ✕
                </div>
                <p className="font-semibold text-red-700">Payment failed</p>
                <p className="text-xs text-slate-500">Bank declined the transaction. Try again.</p>
                <div className="flex gap-2">
                  <button onClick={() => setStage("enter")} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium">
                    Retry
                  </button>
                  <button onClick={reset} className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-medium">
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
