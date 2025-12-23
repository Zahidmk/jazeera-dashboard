import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import Image from "next/image"

interface ImageCardProps {
    title: string
    subtitle?: string
    value: string | number
    description?: string
    image?: string
    icon?: ReactNode
    badge?: {
        text: string
        variant?: 'success' | 'warning' | 'info' | 'default'
    }
    className?: string
    imagePosition?: 'right' | 'background'
}

export function ImageCard({
    title,
    subtitle,
    value,
    description,
    image,
    icon,
    badge,
    className,
    imagePosition = 'right',
}: ImageCardProps) {
    const badgeColors = {
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-orange-100 text-orange-700',
        info: 'bg-blue-100 text-blue-700',
        default: 'bg-gray-100 text-gray-700',
    }

    return (
        <Card className={cn(
            "relative overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-all duration-300",
            className
        )}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">{title}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </CardHeader>

            <CardContent className="pb-4">
                <div className="flex items-end justify-between">
                    <div className="flex-1">
                        <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
                        {description && (
                            <p className="text-sm text-gray-600 mb-3">{description}</p>
                        )}
                        {badge && (
                            <div className="inline-flex items-center gap-2">
                                {icon && <div className="text-blue-500">{icon}</div>}
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-semibold",
                                    badgeColors[badge.variant || 'default']
                                )}>
                                    {badge.text}
                                </span>
                            </div>
                        )}
                    </div>

                    {image && imagePosition === 'right' && (
                        <div className="relative w-32 h-24 ml-4 flex-shrink-0">
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </div>
            </CardContent>

            {image && imagePosition === 'background' && (
                <div className="absolute right-0 bottom-0 w-48 h-48 opacity-10">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain"
                    />
                </div>
            )}
        </Card>
    )
}
