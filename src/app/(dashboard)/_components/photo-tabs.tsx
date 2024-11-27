'use client';

import { TabContent, TabList, TabTrigger, Tabs } from '@/components/ui/tabs';

import PhotoList from './photo-list';

const PhotoTabs = () => {
  return (
    <Tabs className="flex-col" defaultValue="tab1">
      <TabList className="flex shrink-0 border-b border-mauve6" aria-label="Manage images">
        <TabTrigger
          className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current"
          value="tab1"
        >
          Digital
        </TabTrigger>
        <TabTrigger
          className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current"
          value="tab2"
        >
          35mm
        </TabTrigger>
        <TabTrigger
          className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current"
          value="tab3"
        >
          Polaroid
        </TabTrigger>
      </TabList>
      <TabContent value="tab1">
        <PhotoList type={'digital'} />
      </TabContent>
      <TabContent value="tab2">
        <PhotoList type={'35mm'} />
      </TabContent>
      <TabContent value="tab3">
        {/* <PhotoList /> */}
      </TabContent>
    </Tabs>
  );
};

export default PhotoTabs;
