"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type ConfirmationModalProps = {
isOpen: boolean;
onClose: () => void;
onConfirm: () => void;
title: string;
message: string;
};

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) {
return (
    <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        >
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white px-8 py-10 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-gray-900">
                {title}
                </Dialog.Title>
                <div className="my-4">
                <p className="text-md text-gray-500">
                    {message}
                </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="px-8 py-2 rounded-full font-semibold text-[var(--barva-primarni)]" onClick={onClose}>
                    Zrušit
                </button>
                <button type="button" className="px-8 py-2 rounded-full font-semibold text-white bg-[var(--barva-primarni)] text-md cursor-pointer hover:opacity-90 transition-all duration-300 ease-in-out" onClick={onConfirm}>
                    Potvrdit
                </button>
                </div>
            </Dialog.Panel>
            </Transition.Child>
        </div>
        </div>
    </Dialog>
    </Transition>
);
}
