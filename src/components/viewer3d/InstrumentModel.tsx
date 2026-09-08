import React, { Suspense } from 'react';
import { InstrumentData } from '../../content/types';
import { RealisticInstrumentModel } from './RealisticInstrumentModel';

interface InstrumentModelProps {
  instrument: InstrumentData;
}

export const InstrumentModel: React.FC<InstrumentModelProps> = ({ instrument }) => {
  return (
    <Suspense fallback={null}>
      <RealisticInstrumentModel instrument={instrument} />
    </Suspense>
  );
};
