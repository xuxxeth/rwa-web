import { Menus } from "@/components/menu"
import { MainLayout } from "@/layouts/main"
import { IdentityLayout } from "./components/Identitylayout"
import { XFooter } from "@/components/footer"
import { BaseInfo } from "./components/BaseInfo"


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