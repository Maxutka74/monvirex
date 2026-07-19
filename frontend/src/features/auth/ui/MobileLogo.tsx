import logo from "../../../assets/logos/Monvirex.png";

const MobileLogo = () => {
    return (
        <div>
            <img
                src={logo}
                alt="Monvirex Logo"
                className="w-[200px] h-auto -mt-6"
                loading="lazy"
            />
        </div>
    )
}

export default MobileLogo