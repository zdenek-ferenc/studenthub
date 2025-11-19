import React from 'react';

const SocialLink = ({ href, Icon, label }: { href: string | null, Icon: React.ElementType, label: string }) => {
    if (!href) return null;
    const validHref = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
    return (
        <a href={validHref} target="_blank" rel="noopener noreferrer" title={label} className="text-gray-400 hover:text-[var(--barva-primarni)] transition-colors">
            <Icon size={24} />
        </a>
    );
};

export default SocialLink;
