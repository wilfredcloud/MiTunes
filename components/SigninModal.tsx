"use client"

import { useRouter } from "next/navigation"
import Modal from "./Modal"
import { useEffect, useState } from "react"
import Input from "./Input"
import Button from "./Button"
import { AiFillGoogleCircle } from "react-icons/ai"
import { useForm, SubmitHandler } from "react-hook-form"
import useSigninModal from "@/hooks/useSigninModal"
import useSignupModal from "@/hooks/useSignupModal"
import { useUser } from "@/hooks/useUser"
import { Message } from "@/types"
import { appwriteWebClientAccount } from "@/libs/appwriteWeb"
import useSendMagicLinkModal from "@/hooks/useSendMagicLinkModal"
import useForgotPasswordModal from "@/hooks/useForgotPasswordModal"
import { APP_BASE_URL } from "@/libs/configs"
import { FaAws } from "react-icons/fa"

const SigninModal = () => {
  const router = useRouter();
  const { onClose, isOpen } = useSigninModal()
  const signupModal = useSignupModal()
  const sendMagicLinkModal = useSendMagicLinkModal()
  const forgotPasswordModal = useForgotPasswordModal();
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null);

  const { user, setCurrentUser} = useUser()

  interface SignInFormValues {
    email: string,
    password: string
  }

  const { register, handleSubmit, reset, formState: {errors} } = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit: SubmitHandler<SignInFormValues> = async (values) => {
    setIsLoading(true);
    setMessage(null);
   try {
    await appwriteWebClientAccount.createEmailSession(values.email, values.password);
    setCurrentUser();
     
   } catch (error) {
    console.log(error);
    setMessage({ error: (error as Error)?.message })
   }finally{
    setIsLoading(false)
   }
    
  }
const sendVerification  = async () => {
 try {
  const verificationURL = `${APP_BASE_URL}/verify`;
  await appwriteWebClientAccount.createVerification(verificationURL)
  await appwriteWebClientAccount.deleteSession('current');
  setMessage({ success: 'Check your email for the confirmation link' })

 } catch (error) {
  console.log(error)
 }
}

  useEffect(() => {
    
    if (user?.isVerified) {
      router.refresh();
      reset()
      onClose();
    } else if (user && !user?.isVerified) {
      sendVerification()
    }

  }, [user, router, reset, onClose])

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  const openSignupModal = () => {
    onClose()
    signupModal.onOpen()
}

const openSendMagicLinkModal = () => {
  onClose()
  sendMagicLinkModal.onOpen()
}
const openForgotPasswordModal = () => {
  onClose()
  forgotPasswordModal.onOpen()
}

const handleSignInWithGoogle = async () =>{
  console.log('Gorly')
    try {
      await appwriteWebClientAccount.createOAuth2Session('google', APP_BASE_URL, `${APP_BASE_URL}/failure`)
    } catch (error) {
      console.log(error)
    }
}

  return (
    <Modal title="Welcome back"
      description="Sign in your account"
      isOpen={isOpen}
      onChange={onChange}>

      <div className=" flex flex-col gap-y-6 mb-6">
        <Button onClick={handleSignInWithGoogle} disabled={isLoading} type="submit" className=" bg-neutral-700 rounded-md text-white
gap-x-2 flex flex-row justify-center items-center">
          <AiFillGoogleCircle size={26} /> Sign in with Google
        </Button>

        <hr className=" border-neutral-700" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className=" flex flex-col gap-y-4">

        <div>
          <div className="pb-1">
            Email address
          </div>
          <Input
            id="email"
            type="email"
            disabled={isLoading}
            placeholder="Your email address"
            {...register("email", {required: true})}
          />
          {errors?.email && <span className="text-red-600">Email is required</span>}
        </div>

        <div>
          <div className="pb-1">
            Password
          </div>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            placeholder="Your password"
          {...register("password", {required: true})}
          />
          {errors?.password && <span className="text-red-600">Password is required</span>}
        </div>

        <Button disabled={isLoading} type="submit" className=" rounded-md text-white">
          Sign in
        </Button>



      </form>

      <div className="flex flex-col justify-content items-center mt-4 gap-y-2 text-sm pb-2">
        <p onClick={openSendMagicLinkModal} className="text-neutral-500 underline hover:text-neutral-600 cursor-pointer">Send magic link</p>
        <p onClick={openForgotPasswordModal} className="text-neutral-500 underline hover:text-neutral-600 cursor-pointer">Forgot your password?</p>
        <p onClick={openSignupModal} className="text-neutral-500 underline hover:text-neutral-600 cursor-pointer"> {`Don't have an account? Sign up`}</p>
      </div>

      { message?.error && <p className="text-red-600 text-center">{message.error}</p>}
      { message?.success && <p className="text-center">{message.success}</p>}

    </Modal>
  )
}

export default SigninModal