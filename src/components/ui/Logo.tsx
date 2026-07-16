import Link from 'next/link';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="text-accent font-display text-xl">OTAKU</span>
      <span className="text-primary font-display text-xl">HUB</span>
    </Link>
  );
};

export default Logo;
