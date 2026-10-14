import { View } from "react-native"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react-native"
import { ErrorBoundaryProps } from "expo-router"

export const FeedBackPorDefecto = ({ error, retry}: ErrorBoundaryProps) =>{
    return (
        <View className="flex-1 justify-center p-4">
            <Alert variant="destructive" icon={AlertCircleIcon}>
              <AlertTitle>OOooppss!!!</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        </View>

    )
}

export default FeedBackPorDefecto