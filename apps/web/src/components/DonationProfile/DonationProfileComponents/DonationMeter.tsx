import { Button } from '@headlessui/react';
import React, { useState } from 'react';
import styled from 'styled-components';

interface DonationMeterProps {
  goal: number;
  total: number;
}

interface StyledSpanProps {
  background: string;
  height?: string;
}

interface StyledDivProps {
  background: string;
  borderRadius?: string;
  height?: string;
  position?: string;
  right?: string;
  top?: string;
  width?: string;
  zIndex?: string;
}

const DonationMeterContainer = styled.div`
  font-family: Helvetica;
  margin-left: 30px;
`;

const Goal = styled.strong`
  font-size: 24px;
  position: flex;
`;

const GoalAmount = styled.strong`
  font-size: 30px;
`;

const Glass = styled.span<StyledDivProps>`
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderRadius || '100px 100px 0 0'};
  display: block;
  height: ${(props) => props.height || '300px'};
  margin: 0 35px 10px;
  padding: 5px;
  position: ${(props) => props.position || 'relative'};
  width: ${(props) => props.width || '20px'};
`;

const Total = styled.strong`
  font-size: 24px;
  position: flex;
  right: 35px;
`;

const Amount = styled.span<StyledSpanProps>`
  background: ${(props) => props.background};
  border-radius: 100px;
  display: block;
  width: 20px;
  position: absolute;
  right: 0px;
  bottom: 5px;
  height: ${(props) => props.height};
`;

const Bulb = styled.div<StyledDivProps>`
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderRadius || '100px'};
  display: block;
  height: ${(props) => props.height || '50px'};
  margin: 0 35px 10px;
  padding: 0px;
  position: ${(props) => props.position || 'relative'};
  top: ${(props) => props.top || '-20px'};
  right: ${(props) => props.right || '15px'};
  width: ${(props) => props.width || '50px'};
`;

const RedCircle = styled.span<StyledDivProps>`
  background: ${(props) => props.background};
  border-radius: 100px;
  display: block;
  positon: relative;
  height: ${(props) => props.height || '50px'};
  width: ${(props) => props.width || '50px'};
`;

const Filler = styled.span<StyledDivProps>`
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderRadius || '100px 100px 0 0'};
  display: block;
  height: ${(props) => props.height || '30px'};
  width: ${(props) => props.width || '20px'};
  position: ${(props) => props.position || 'relative'};
  top: ${(props) => props.top || '-65px'};
  right: ${(props) => props.right || '-15px'};
`;

const TickMark = styled.div<StyledDivProps>`
  background: ${(props) => props.background || '#000000'};
  height: 2px;
  width: 10px;
  position: absolute;
  top: calc(${(props) => props.top || '0%'} - 1px);
  right: 75%;
  transform: translateX(50%);
  z-index: 1;
`;

const DonationMeter: React.FC<DonationMeterProps> = ({ goal, total }) => {
  const [showShare, setShowShare] = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  const handleShowShare = () => {
    setShowShare(true);
  };

  const handleShowDonate = () => {
    setShowDonate(true);
  };

  const fillPercentage = (total / goal) * 100;
  const height = `${fillPercentage}%`;
  return (
    <div className="flex flex-row">
      <div className="flex w-1/2 flex-col items-center justify-center">
        <div
          className="relative text-center text-black dark:text-white"
          id="left"
        >
          <div>
            <Total>${total}</Total>
          </div>
          <div className="text-gray-400">
            <Goal>raised of ${goal} goal</Goal>
          </div>
          <Button
            className="mb-5 mt-5 w-full rounded-full px-4 py-2 text-sm text-white"
            onClick={handleShowShare}
            style={{ background: '#da5597' }}
          >
            Donate Now
          </Button>
          <Button
            className="w-full rounded-full px-4 py-2 text-sm text-white"
            onClick={handleShowDonate}
            style={{ background: '#de78ab' }}
          >
            Share
          </Button>
        </div>
      </div>

      <div className="flex w-1/2 flex-col">
        <DonationMeterContainer className="donation-meter flex flex-col items-center">
          <Glass background="#e5e5e5">
            <TickMark background="#000000" top="10%" />
            <TickMark background="#000000" top="20%" />
            <TickMark background="#000000" top="30%" />
            <TickMark background="#000000" top="40%" />
            <TickMark background="#000000" top="50%" />
            <TickMark background="#000000" top="60%" />
            <TickMark background="#000000" top="70%" />
            <TickMark background="#000000" top="80%" />
            <TickMark background="#000000" top="90%" />

            <Amount background="#da5597" height={height} />
          </Glass>

          <Bulb
            background="#e5e5e5"
            height="50px"
            right="0px"
            top="-20px"
            width="50px"
          >
            <RedCircle background="#da5597" />
            <Filler
              background="#da5597"
              height="30px"
              right="-15px"
              top="-65px"
              width="20px"
            >
              <span />
            </Filler>
          </Bulb>
        </DonationMeterContainer>
      </div>
    </div>
  );
};

export default DonationMeter;
