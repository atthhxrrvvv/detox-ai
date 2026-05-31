export async function GET(request: Request) {
  const url = new URL(request.url);

  return Response.json({
    paymentId: url.searchParams.get("paymentId"),
    status: "pending",
    tracker: ["Submitted", "Under Review", "Approved", "Premium Activated"],
  });
}

