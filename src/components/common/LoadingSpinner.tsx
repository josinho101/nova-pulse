import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export interface LoadingSpinnerProps {
  size?: number;
  py?: number;
}

export function LoadingSpinner({ size = 28, py = 6 }: LoadingSpinnerProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py }}>
      <CircularProgress size={size} />
    </Box>
  );
}
