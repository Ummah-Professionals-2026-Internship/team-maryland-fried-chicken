import MainLayout from "@/layouts/MainLayout";
import LoadingState from "@/components/ui/LoadingState";

export default function AdvisorProfileLoading() {
  return (
    <MainLayout>
      <LoadingState
        title="Advisor Profile"
        description="Loading advisor profile..."
        variant="profile"
      />
    </MainLayout>
  );
}
