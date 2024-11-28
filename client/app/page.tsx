
'use client'
import React, {FC, useState} from "react";
import Heading from "./utils/Heading";

interface Props {}

const Page: FC<Props> = (props) => {
    return (
      <div>
        <Heading
          title="Vitalis Solutions Group"
          description="Transformative solutions from industry experts ready to address regulatory and workforce pressures"
          keywords="Data Analysis, Data Analytics, Linear Regression Models"
        />
      </div>
    )
};

export default Page;