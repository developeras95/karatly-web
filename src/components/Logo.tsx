import Box from '@mui/material/Box';

/** Karatly's mark: a bullion bar with a sparkle, drawn for this project. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Box component="svg" viewBox="0 0 32 32" width={size} height={size} aria-hidden sx={{ color: 'primary.main' }}>
      <path d="M8 13h16l5 12H3z" fill="currentColor" />
      <path d="M10 16.5h8" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
      <path d="M16 3l1.4 3.1L20.5 7.5l-3.1 1.4L16 12l-1.4-3.1-3.1-1.4 3.1-1.4z" fill="currentColor" />
    </Box>
  );
}
