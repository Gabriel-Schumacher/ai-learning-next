"use client";
import React, { useEffect, useContext } from "react";
import DataCreation from "@/app/components/DataCreation/DataCreation";
import CollectionsDisplay from "@/app/components/Collections/CollectionsDisplay";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import LibraryPage from "@/app/routes/library/page";

function StudyPage() {
    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a AiDataProvider");
    }
    const { data } = context;

    return (
        <>
        {data && data.sortedData &&
            <div className="card w-full h-full flex flex-col gap-2 p-2 md:p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
                {data.sortedData.currentPage === 'DATA_CREATION' &&
                    <DataCreation />
                }
                {data.sortedData.currentPage === 'STUDY' &&
                    <CollectionsDisplay />
                }
                {data.sortedData.currentPage === 'LIBRARY' &&
                    <LibraryPage />
                }
            </div>
        }
        </>
    );
}

export default StudyPage;
