import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertCircle } from 'lucide-react'

const NoPavilionSelectedAlert = () => {
    return (
        <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                Please select a pavilion first.
            </AlertDescription>
        </Alert>
    )
}

export default NoPavilionSelectedAlert
