import { FiArrowUpRight } from "react-icons/fi"
import ai_robot from "../../assets/images/Ai_Decoration.webp"
import {useStore} from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";
import {useNavigate} from "react-router-dom";


const AIChart = () => {
    const navigate = useNavigate()
    const theme = useStore(themeStore, (state) => state.theme);

    return (
        <div className={`relative w-full h-[250px] flex flex-row rounded-[20px] text-white p-5 ${
            theme === 'dark'
                ? 'bg-linear-to-tr from-[#8B7CF6] to-[#1597FF] shadow-[0_0_25px_rgba(21,151,255,0.18)]'
                : 'bg-linear-to-tr from-[#9F87FF] to-[#429EFF]'
        }`}>
            <div className="relative w-full h-full lg:w-[55%] flex flex-col justify-center gap-4">
                <h3 className='text-[28px] whitespace-nowrap'>Trade smarter with <br/> MONVIREX AI</h3>
                <p className='xl:whitespace-nowrap'>Automate trades based on user-defined criteria,<br className="hidden sm:block" /> using AI algorithms</p>
                <button className='w-full max-w-[150px] h-[54px] flex flex-row justify-center items-center gap-3 text-black bg-white rounded-full cursor-pointer'
                        onClick={() => navigate('/ai-assistant')}
                >
                    <span>Try Now</span>
                    <FiArrowUpRight size={18} />
                </button>
            </div>
            <img className="absolute top-3 xl:top-3 2xl:top-3 -right-6 w-[186px] h-[244px]" src={ai_robot} alt='Robot AI'/>
        </div>
    )
}

export default AIChart