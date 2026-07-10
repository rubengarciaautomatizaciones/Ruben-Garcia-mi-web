export function useToast() {
  return {
    toast: (props: { title?: string; description?: string; variant?: string }) => {
      console.log("Toast:", props.title, props.description);
    }
  };
}
