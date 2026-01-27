import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { paymentAPI } from "@/lib/payment-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const paymentId = searchParams.get("payment_id");

    if (!sessionId && !paymentId) {
      setStatus("error");
      setMessage("No payment session found");
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await paymentAPI.checkPaymentStatus(sessionId || undefined, paymentId || undefined);
        const paymentStatus = response.data.status;
        
        if (paymentStatus === "completed" || paymentStatus === "paid") {
          setStatus("success");
          setMessage("Payment successful! Your account has been upgraded.");
        } else if (paymentStatus === "pending") {
          setStatus("loading");
          setMessage("Processing your payment...");
          // Retry after 2 seconds for pending status
          setTimeout(() => {
            checkPaymentStatus();
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Payment was not completed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "An error occurred");
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-primary" />
              <CardTitle>Processing Payment</CardTitle>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <CardTitle>Payment Successful</CardTitle>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
              <CardTitle>Payment Failed</CardTitle>
            </>
          )}
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}
          {status === "error" && (
            <Button onClick={() => navigate("/pricing")} className="w-full">
              Back to Pricing
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
