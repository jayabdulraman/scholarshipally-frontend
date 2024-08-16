'use client'

import React, { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, Database, LucideProps } from 'lucide-react';
import Cookies from 'js-cookie';

export function SearchTypeDropdown() {
  const [searchType, setSearchType] = useState({ type: 'Database Search', icon: Database, description: 'Conduct your search from a 1000 funding database' });
  Cookies.set('newSearchType', searchType.type.replace(/\s/g, ""), { expires: 7 });

  const searchOptions = [
    { type: 'Database Search', icon: Database, description: 'Conduct your search from a 1000 funding database' },
    { type: 'Google Search', icon: Search, description: 'Explore a wide range of online funding sources and opportunities' },
  ];

  const handleOptionClick = (option: any) => {
    setSearchType(option);
    Cookies.set('newSearchType', option.type.replace(/\s/g, ""), { expires: 7 });
  };

  useEffect(() => {
    Cookies.set('newSearchType', searchType.type.replace(/\s/g, ""), { expires: 7 });
  });

  return (
    <div className="relative h-5 w-25 m-1">
        {/* <div className="absolute left-0 top-0 h-16 w-16"> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-lg md:text-lg border ml-3" variant="ghost">
                {React.createElement(searchType.icon, { className: "mr-2 h-5 w-5" })}
                {searchType.type} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="absolute left-0 top-full min-w-[300px] ml-2">
              {searchOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.type} 
                  onClick={() => handleOptionClick(option)}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex items-center text-lg font-medium">
                    {React.createElement(option.icon, { className: "mr-2 h-6 w-6" })}
                    {option.type}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    {option.description}
                  </p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        {/* </div> */}
      </div>
  );
};
