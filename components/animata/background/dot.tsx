interface DotProps {
  /**
   * Color of the dot
   */
  color?: string;
 
  /**
   * Size of the dot in pixels
   */
  size?: number;
 
  /**
   * Spacing between dots
   */
  spacing?: number;
 
  /**
   * Content of the component
   */
  children?: React.ReactNode;
 
  /**
   * Class name
   */
  className?: string;
 
  style?: React.CSSProperties;
}
 
function Placeholder() {
  return (
    <div className="flex h-full min-h-64 w-full min-w-72 items-center justify-center">
      <div className="rounded bg-white px-4 py-2">This has dot background</div>
    </div>
  );
}
 
export default function Dot({
  color = "rgb(233, 213, 255)", // Gentle purple for dots
  size = 1,
  spacing = 20,
  children,
  className,
  style = {
    backgroundColor: "rgb(250, 245, 255)", // Very light purple background
  },
}: DotProps) {
  return (
    <div
      style={{
        ...style,
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size}px)`,
        backgroundSize: `calc(${spacing} * ${size}px) calc(${spacing} * ${size}px)`,
      }}
      className={className}
    >
      {children ?? <Placeholder />}
    </div>
  );
} 