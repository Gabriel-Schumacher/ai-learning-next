"use client";

import React, { useContext, useEffect, useState } from "react";
import CardIcon from "@/app/components/customSvg/Card";
import ListIcon from "@/app/components/customSvg/List";
import BookIcon from "@/app/components/customSvg/Book";
import PlusIcon from "../customSvg/Plus";
import EditIcon from "../customSvg/Edit";
import LoadingIcon from "../LoadingIcon";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Marked } from "marked";
import DOMPurify from "dompurify";
import ButtonLink from "../ButtonLink";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import * as Types from "@/lib/types/types_new";
import CollectionItem from "./CollectionItem";



function CollectionsDisplay() {

  const [allQuizFiles, setAllQuizFiles] = useState<Types.QuizFile[]>([]);

  const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a AiDataProvider");
    }
  const { data, dispatch } = context;

  useEffect(() => {
    if (data && data.sortedData && data.sortedData.folders) {
      const quizFiles = data.sortedData.folders.flatMap(folder => 
        folder.files.filter(file => file.type === 'quiz')
      ) as Types.QuizFile[];
      setAllQuizFiles(quizFiles);
    }
  }, [data])

  return (
    <>
      {allQuizFiles.length > 0 && (
        <>
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto]">
            <h2 className="text-2xl font-semibold">
              Your study collections
            </h2>
            <ButtonLink local_href="LIBRARY">
              Library
            </ButtonLink>
          </div>

          {/* Collection List */}
          <ul className="flex flex-col gap-2 mb-2">
            {allQuizFiles.map((quizFile, index) => (
              <CollectionItem
                key={index}
                index={index}
                collectionFile={quizFile}
              />
            ))}
          </ul>

          {/* Button to Create a Collection */}
          <button className="btn" onClick={() => dispatch({ type: "SET_PAGE", payload: "DATA_CREATION" })}>
              <div className="w-[24px] h-[24px]">
                  <PlusIcon color={"text-surface-50"}/>                        
              </div>

              New Collection
          </button>
        </>
      )}
    </>
  );
}
export default CollectionsDisplay;
