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
import { PlusSign } from "../IconsIMGSVG";



function CollectionsDisplay() {

  const [allQuizFiles, setAllQuizFiles] = useState<Types.QuizFile[]>([]);

  const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error("DataContextProvider must be used within a AiDataProvider");
    }
  const { data, dispatch } = context;

  useEffect(() => {
      if (data && data.sortedData && data.sortedData.folders) {
          if (!data.sortedData.currentFolderId) {
            const quizFiles = data.sortedData.folders.flatMap(folder => 
              folder.files.filter(file => file.type === 'quiz')
            ) as Types.QuizFile[];
            setAllQuizFiles(quizFiles);
        } else {
          const currentFolder = data.sortedData.folders.find(folder => folder.id === data.sortedData?.currentFolderId);
          if (currentFolder) {
            const quizFiles = currentFolder.files.filter(file => file.type === 'quiz') as Types.QuizFile[];
            setAllQuizFiles(quizFiles);
          }
        }
    }
  }, [data])

  return (
    <>
      {allQuizFiles.length > 0 && (
        <>
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto]">
            <h2 className="text-2xl font-semibold">
              Your study collections {data && data.sortedData && data.sortedData.currentFolderId && data.sortedData.folders.find(folder => folder.id === data.sortedData?.currentFolderId)?.name && `in ${data.sortedData.folders.find(folder => folder.id === data.sortedData?.currentFolderId)?.name}`}
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

        </>
      )}
      {(allQuizFiles.length < 0 || !allQuizFiles.length) && (
        <p className="text-surface-950-50 w-full block text-center ">No collections found. Please create a new collection.</p>
      )}
      {/* Button to Create a Collection */}
      <button className="btn" onClick={() => dispatch({ type: "SET_PAGE", payload: "DATA_CREATION" })}>
          <PlusSign
              background={true}
              special={true}
              width="w-3"
          />
          New Collection
      </button>
    </>
  );
}
export default CollectionsDisplay;
