import { FiArrowUpRight } from "react-icons/fi"
import ai_robot from "../../assets/images/Ai_Decoration.svg"


const AIChart = () => {
    return (
        <div className='relative h-[250px] flex flex-col justify-center gap-2 rounded-[20px] text-white bg-linear-to-tr from-[#9F87FF] to-[#429EFF] p-5'>
            <h3 className='w-[400px] text-[32px]'>Trade smarter with MONVIREX AI</h3>
            <p className='w-[350px]'>Automate trades based on user-defined criteria, using AI algorithms</p>
            <div className='w-full max-w-[150px] h-[54px] flex flex-row justify-center items-center gap-3 text-black bg-white rounded-full cursor-pointer'>
                <button>Try Now</button>
                <FiArrowUpRight size={18} />
            </div>
            <img className='absolute right-0.5 top-3 w-[186px] h-[244px]' src={ai_robot} alt="Robot AI"/>
        </div>
    )
}

export default AIChart