import { Button } from "@/components/ui/button"

function Components() {
  return (
    <div >
      <div className="">Button:</div>
      <div className=" flex flex-col gap-y-3">
        <Button className="w-[625px]">Default</Button>
        <Button className="w-[625px]" variant={'secondary'} >Secondary</Button>
        <Button className="w-[625px]" variant={'primary'} >Primary</Button>
        <Button className="w-[625px]" variant={'warning'} >Warning</Button>
        <Button className="w-[625px]" variant={'warning'} disabled >Disabled</Button>

        <Button className="w-[625px]" outline>Default</Button>
        <Button className="w-[625px]" variant={'secondary'} outline >Secondary</Button>
        <Button className="w-[625px]" variant={'primary'} outline >Primary</Button>
        <Button className="w-[625px]" variant={'warning'} outline >Warning</Button>
        <Button className="w-[625px]" outline disabled >Disabled</Button>
        <Button className="w-[625px]" variant={'primary'} disabled loading >Loading</Button>

      </div>
      
    </div>
  )
}

export default Components