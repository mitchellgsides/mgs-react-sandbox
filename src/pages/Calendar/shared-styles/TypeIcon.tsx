import { WorkoutType } from "../context/fakeData";
import { MdOutlineDirectionsBike } from "react-icons/md";
import { FaWater } from "react-icons/fa";
import { IoBarbell } from "react-icons/io5";
import { GiPillow, GiConverseShoe } from "react-icons/gi";
import { PiFlowerLotus } from "react-icons/pi";
import { TbActivityHeartbeat } from "react-icons/tb";

type IconProps = {
  size: number;
  type: WorkoutType;
};

const TypeIcon = ({ size, type }: IconProps) => {
  const iconStyle = { height: `${size}px`, width: `${size}px` };

  switch (type) {
    case WorkoutType.RUN:
      return <GiConverseShoe style={iconStyle} />;
    case WorkoutType.SWIM:
      return <FaWater style={iconStyle} />;
    case WorkoutType.BIKE:
      return <MdOutlineDirectionsBike style={iconStyle} />;
    case WorkoutType.YOGA:
      return <PiFlowerLotus style={iconStyle} />;
    case WorkoutType.STRENGTH:
      return <IoBarbell style={iconStyle} />;
    case WorkoutType.REST:
      return <GiPillow style={iconStyle} />;
    case WorkoutType.OTHER:
    default:
      return <TbActivityHeartbeat style={iconStyle} />;
  }
};

export default TypeIcon;
