import { signOutAccount } from "@/lib/actions/user.actions";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Footer = ({user, type='desktop'} : FooterProps) => {

    const router = useRouter();

    const handleLogout = async () => {
        const signOut = await signOutAccount();
        if (signOut) router.push('/sign-in');
    }

    return (
        <footer className="footer">
            <div className={type === "mobile" ? "footer_name-mobile" : "footer_name"}>
                <p className="text-lg font-bold text-gray-700">
                    {user?.name[0].toUpperCase()}
                </p>
            </div>

            <div className={type === "mobile" ? "footer_email-mobile" : "footer_email"}>
                <h1 className="text-12 truncate text-gray-700 font-semibold">
                    {user?.name}
                </h1>
                <p className="text-10 truncate font-normal text-gray-600">
                    {user?.email}
                </p>
            </div>

            <div className="footer_image" onClick={handleLogout}>
                <Image src="icons/logout.svg" fill alt="jsm"/>
            </div>
        </footer>
    )
}

export default Footer;