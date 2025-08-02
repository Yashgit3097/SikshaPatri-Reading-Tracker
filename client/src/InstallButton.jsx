import React, { useEffect, useState } from 'react'

export default function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstall, setShowInstall] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstall(true)
        }
        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setShowInstall(false)
        }
    }

    if (!showInstall) return null

    return (
        <button
            onClick={handleInstall}
            className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
            Install App
        </button>
    )
}
