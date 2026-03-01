"use client"

import React from "react"
import {
    FileCode2,
    Hash,
    Braces,
    Code2,
    FileText,
    FileJson,
    Type,
    FileType
} from "lucide-react"
import { type SupportedLanguage } from "@/context/EditorContext"

interface FileIconProps extends React.ComponentProps<typeof FileText> {
    language?: string
    filename?: string
}

export function FileIcon({ language, filename, className, ...props }: FileIconProps) {
    const lang = language?.toLowerCase() || filename?.split(".").pop()?.toLowerCase() || ""

    // Mapping languages/extensions to icons
    switch (lang) {
        case "typescript":
        case "ts":
        case "tsx":
            return <FileCode2 className={className} {...props} />
        case "javascript":
        case "js":
        case "jsx":
            return <FileType className={className} {...props} />
        case "python":
        case "py":
            return <Hash className={className} {...props} />
        case "json":
            return <FileJson className={className} {...props} />
        case "html":
            return <Code2 className={className} {...props} />
        case "css":
            return <Hash className={className} {...props} />
        default:
            return <FileText className={className} {...props} />
    }
}
