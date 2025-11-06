const HeaderBox = ({ type = "title", title, subtext, user }: HeaderBoxProps) => {
    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl lg:text-30 font-semibold text-gray-900">
                {title}
                {type === "greeting" && (
                    <span className="text-[#4893ff]">&nbsp;{user}</span>
                )}
            </h1>
            <p className="header-box-subtext">{subtext}</p>
        </div>
    )
}

export default HeaderBox;