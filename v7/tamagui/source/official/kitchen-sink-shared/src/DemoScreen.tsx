import * as Demos from '@tamagui/demos'
import { H1, YStack } from 'tamagui'

// The host renders the back control in the navigation header instead.
export function DemoScreen({ demoName }: { demoName: string }) {
  const componentName = `${demoName}Demo`
  const DemoComponent = (Demos as any)[componentName] ?? NotFound

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} justify="center" items="center" gap="$4">
        <YStack minW={200} maxW={600} items="center" p="$10" rounded="$6">
          <DemoComponent />
        </YStack>
      </YStack>
    </YStack>
  )
}

const NotFound = () => <H1>Not found!</H1>
