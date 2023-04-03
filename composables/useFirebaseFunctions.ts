import { getFunctions, httpsCallable } from '@firebase/functions'

export const useFirebaseFunctions = () => {
  const firebaseApp = useFirebaseApp()
  const functions = getFunctions(firebaseApp, 'europe-west3')

  return <Input = unknown, Output = unknown>(name: string) =>
    httpsCallable<Input, Output>(functions, name)
}
