export async function POST() {
  return Response.json({
    status: "planned",
    message: "Firebase Storage upload handling is reserved for Pro, Premium, and Creator plans.",
  });
}

