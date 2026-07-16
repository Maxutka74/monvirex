import { TbHomeCog } from "react-icons/tb"
import logo from '../../assets/MonvirexWhiteLogo.png'
import {CgFileDocument} from "react-icons/cg";
import {PiLightningLight, PiShootingStarLight} from "react-icons/pi";

const MonvirexAICard = () => {
    return (
        <div className='w-[440px] h-[400px] flex flex-col gap-[20px] bg-gradient-to-tr from-[#429EFF] via-[#6D8CFF] to-[#9B7CFF] p-5 rounded-[20px]'>
            <div>
                <div className='flex flex-row items-center gap-2'>
                    <img className='w-[60px] h-[60px]' src={logo} alt="Monvirex Logo"/>
                    <h4 className='text-[28px] font-medium text-white'>Monvirex AI</h4>
                </div>
            </div>
            <div className='flex flex-row items-center justify-center gap-3'>
                <div>
                    <div className='w-[194px] flex flex-col justify-center items-center gap-5 bg-white rounded-[20px]'>
                        <div className='flex flex-row items-center gap-3 pt-[20px]'>
                            <div className='w-[44px] h-[44px] flex items-center justify-center bg-[#429EFF] rounded-full'>
                                <TbHomeCog size={22} className='text-white' />
                            </div>
                            <h5 className='w-[106px] text-[20px] font-medium'>AI Market <br/> Predictor</h5>
                        </div>
                        <p className='text-[#6F6F6F] pl-4 pr-4 pb-[20px] '>
                            Analyze live market trends,
                            price changes, and volume
                            to spot trading signals.
                        </p>
                    </div>
                </div>
                <div>
                    <div className='w-[194px] flex flex-col justify-center items-center gap-5 bg-white rounded-[20px]'>
                        <div className='flex flex-row items-center gap-3 pt-[20px]'>
                            <div className='w-[44px] h-[44px] flex items-center justify-center bg-[#9F87FF] rounded-full'>
                                <CgFileDocument size={22} className='text-white' />
                            </div>
                            <h5 className='w-[106px] text-[20px] font-medium'>AI Portfolio <br/> Optimizer</h5>
                        </div>
                        <p className='text-[#6F6F6F] pl-4 pr-4 pb-[20px] '>
                            Review your assets and
                            suggest smarter allocation
                            based on risk and trends.
                        </p>
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center justify-center gap-2'>
                <div className='w-[300px] h-[48px] relative text-[#666D80] bg-white flex flex-row items-center justify-start rounded-full'>
                    <PiLightningLight size={22} className='absolute left-3' />
                    <input className='w-[300px] h-[48px] rounded-full pl-[44px] outline-none' type="text" placeholder="Search with AI" />
                </div>
                <button className='w-[92px] h-[48px] flex flex-row items-center bg-white rounded-full gap-2 p-1 cursor-pointer'>
                    <div className='w-[40px] h-[40px] flex items-center justify-center text-white bg-gradient-to-tr from-[#429EFF] via-[#33CFFF] to-[#9F87FF] rounded-full'>
                        <span>AI</span>
                    </div>
                    <PiShootingStarLight size={26} className='text-[#429EFF]' />
                </button>
            </div>
        </div>
    )
}

export default MonvirexAICard