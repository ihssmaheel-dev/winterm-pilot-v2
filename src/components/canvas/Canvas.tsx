import { TabBar } from './TabBar'
import { WtWindow } from './WtWindow'

export function Canvas() {
  return (
    <>
      <TabBar />
      <div className="flex-1 p-[14px] overflow-hidden relative">
        <WtWindow />
      </div>
    </>
  )
}
