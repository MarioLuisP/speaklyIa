import Image from 'next/image';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'circle';
  name?: string; // For fallback initials
  className?: string;
  dataAihint?: string;
}

const sizeMap = {
  xs: 'w-8 h-8 text-xs', // approx 32px
  sm: 'w-12 h-12 text-sm', // approx 48px
  md: 'w-16 h-16 text-base', // approx 64px
  lg: 'w-24 h-24 text-lg', // approx 96px
};

export function UserAvatar({
  src,
  alt = "User Avatar",
  size = 'md',
  shape = 'circle',
  name,
  className,
  dataAihint,
}: UserAvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  const placeholderImage = `https://placehold.co/100x100.png?text=${initials}`;

  return (
    <div className={`avatar ${src || name ? '' : 'placeholder'} ${className}`}>
      <div className={`${sizeMap[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden`}>
        {src ? (
          <Image 
            src={src} 
            alt={alt} 
            width={parseInt(sizeMap[size].split(' ')[0].substring(2)) * 4} // Approximate pixel width
            height={parseInt(sizeMap[size].split(' ')[1].substring(2)) * 4} // Approximate pixel height
            className="object-cover w-full h-full"
            data-ai-hint={dataAihint}
          />
        ) : name ? (
          <div className="flex items-center justify-center w-full h-full bg-neutral-focus text-neutral-content">
            <span>{initials}</span>
          </div>
        ) : (
           <Image 
            src={placeholderImage} 
            alt={alt} 
            width={parseInt(sizeMap[size].split(' ')[0].substring(2)) * 4}
            height={parseInt(sizeMap[size].split(' ')[1].substring(2)) * 4}
            className="object-cover w-full h-full"
            data-ai-hint={dataAihint || "avatar placeholder"}
          />
        )}
      </div>
    </div>
  );
}
