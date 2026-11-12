export default function ScanCompanionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Navbar, no padding — full screen for the phone camera experience
  return <>{children}</>;
}

