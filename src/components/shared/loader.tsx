import { ClipLoader } from "react-spinners";

export default function Loading() {
  const cssOverride = {
    borderColor: "none",
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <ClipLoader cssOverride={cssOverride} />
    </div>
  );
}
