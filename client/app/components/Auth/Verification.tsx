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
    </div>
  )
};

export default Verification;