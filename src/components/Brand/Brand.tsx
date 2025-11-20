import "./Brand.css";

import Image from "next/image";

export default function Brand(){

    return(
        <div className="brand">
            <div className="brand-logo">
                <Image
                    src="/images/logo.png"
                    width="220"
                    height="94"
                    className="object-contain"
                    alt="Tbilingo"
                />
            </div>
            <div className="sr-only">Tbilingo</div>
            <h1 className='brand-descr'>Your First Step to Learning Georgian</h1>
        </div>
    )

}