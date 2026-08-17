import { FiArrowUpRight } from "react-icons/fi"
import ai_robot from "../../assets/images/Ai_Decoration.svg"


const AIChart = () => {
    return (
        <div className='relative w-full h-[250px] flex flex-row rounded-[20px] text-white bg-linear-to-tr from-[#9F87FF] to-[#429EFF] p-5'>
            <div className="relative z-10 w-full h-full lg:w-[55%] flex flex-col justify-center gap-4">
                <h3 className='text-[28px] whitespace-nowrap'>Trade smarter with <br/> MONVIREX AI</h3>
                <p className='xl:whitespace-nowrap'>Automate trades based on user-defined criteria,<br className="hidden sm:block" /> using AI algorithms</p>
                <div className='w-full max-w-[150px] h-[54px] flex flex-row justify-center items-center gap-3 text-black bg-white rounded-full cursor-pointer'>
                    <button className='cursor-pointer'>Try Now</button>
                    <FiArrowUpRight size={18} />
                </div>
            </div>
            <img className="absolute top-3 xl:top-3 2xl:top-3 -right-6 w-[186px] h-[244px]" src={ai_robot} alt='Robot AI'/>
        </div>
    )
}

export default AIChart