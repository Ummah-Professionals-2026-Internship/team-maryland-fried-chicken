import MainLayout from "@/layouts/MainLayout";
import LoadingState from "@/components/ui/LoadingState";

export default function AdvisorsLoading() {
  return (
    <MainLayout>
      <LoadingState
        title="Advisor Directory"
        description="Loading advisor directory..."
        variant="directory"
      />
    </MainLayout>
  );
}
