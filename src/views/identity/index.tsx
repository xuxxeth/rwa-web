import { Menus } from "@/components/menu"
import { MainLayout } from "@/layouts/main"
import { XFooter } from "@/components/footer"
import { BaseInfo } from "./components/BaseInfo"
import { IdentityLayout } from "./components/IdentityLayout"


function Identity() {

  return (
    <>
      <Menus />
      <MainLayout>
        <IdentityLayout>
          <div className="mt-8">
            <BaseInfo />

          </div>
        </IdentityLayout>
      </MainLayout>
      <XFooter />
    </>
  )

}

export default Identity