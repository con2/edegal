declare module 'react-svg-spinner' {
  export interface SpinnerProps {
    size?: string;
    color?: string;
    thickness?: number;
    gap?: number;
    speed?: 'fast' | 'slow';
  }

  const Spinner: React.FC<SpinnerProps>;
  export default Spinner;
}
