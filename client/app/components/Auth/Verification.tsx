import { styles } from '@/app/styles/style';
import React, { FC, useRef, useState } from 'react'
import {toast} from 'react-hot-toast';
import { VscWorkspaceTrusted } from 'react-icons/vsc';

type Props = {
    setRoute: (route: string) => void;
};

type VerifyNumber = {
    "0": string;
    "1": string;
    "2": string;
    "3": string;
};

const Verification : FC<Props> = ({setRoute}) => {
    const [invalidError, setInvalidError] = useState<boolean>(false);
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const [verifyNumber, setVerifyNumber] = useState<VerifyNumber>({
        0: "",
        1: "",
        2: "",
        3: "",
      });

    const verificationHandler = async () => {
        console.log('test');
    }

    const handleInputChange = (index:number, value:string) => {
        setInvalidError(false) // Clear any existing error state.
        const newVerifyNumber = {...verifyNumber, [index]:value}; // Update the value at the specific input field.
        setVerifyNumber(newVerifyNumber); // Update the state.

        if(value == "" && index > 0){
            // If the input is empty and not the first field, move the focus to the previous field.
            inputRefs[index-1].current?.focus();
        } else if(value.length === 1 && index < 3){
            // If the input has 1 character and is not the last field, move the focus to the next field.
            inputRefs[index+1].current?.focus();
        }
    }

  return (
    <div>
        <h1 className={`${styles.title}`}>
            Verify Your Account
        </h1>
        <br />
        <div className = "w-full flex items-center justify-center mt-2">
            <div className="w-[80px] h-[80px] rounded-full bg-[#497DF2] flex items-center justify-center">
            <VscWorkspaceTrusted size={40} />
            </div>
        </div>
        <br />
      <br />
      <div className="m-auto flex items-center justify-around">
        {Object.keys(verifyNumber).map((key,index)=> (
            <input type="text"
            key={key}
            ref={inputRefs[index]}
            className={`w-[65px] h-[65px] bg-transparent border-[3px] rounded-[10px] flex items-center text-black dark:text-white justify-center text-[18px] font-Poppins outline-none text-center ${
                invalidError
                  ? "shake border-red-500"
                  : "dark:border-white border-[#0000004a]"
              }`}
           placeholder=""
           maxLength={1}
           value={verifyNumber[key as keyof VerifyNumber]}   
           onChange={(e) => handleInputChange(index, e.target.value)}
        />
        ))}
      </div>
      <br />
      <br />
    </div>
  )
};

export default Verification;