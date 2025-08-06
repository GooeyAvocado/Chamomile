import { Close } from "@mui/icons-material"
import { ClickAwayListener, IconButton, ListItem, MenuItem, MenuList, Paper, Popper, TextField } from "@mui/material"
import { useRef, useState } from "react"

export interface AutoCompletes<T = any> {

    name: string

    /**
     * Data for this autocomplete
     */
    data: T[]

    /**Prefix to be on the look out to suggest results */
    prefix: string

    /** Minimum length of characters to expect before results are displayed (Use if you have a lot of data) */
    minSearchLength?: number

    /** Maximum number of suggestions to show at a time */
    maxSuggestions?: number

    /**Suffix to delineate the end of an autocomplete. If not set, any whitespace will be used as the suffix  */
    suffix?: string

    /**Search function to match a data element. If not set, we'll match the toString(). The query string will not contain the prefix */
    matcher?: (val: T, query: string) => boolean

    /**Display function to render an element in the list of suggestions. The returned react node will be wrapped in a ListItem.  If not set, we'll use the toString().*/
    renderer?: (val: T) => React.ReactNode

    /**Function to extract a string from the data to add to the textfield */
    value?: (val: T) => string
}

interface CursorContext {
    currentPos: number,
    query: string,
    prefix: string;
    suffix: string;
    suggestions: any[]
    renderer: (val: any) => React.ReactNode
    value: (val: any) => string
    minLength: number
    setName: string,
    total: number,
    resultsTotal: number

};

export default function AutocompleteTextfield({ data, autocompleteZIndex, ...props }: {
    data: AutoCompletes[],
    autocompleteZIndex?: number
} & React.ComponentProps<typeof TextField>) {

    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const textfieldRef = useRef<HTMLDivElement | null>(null);
    const menuListRef = useRef<HTMLLIElement>(null);
    const [anchorEl, setAnchorEl] = useState<any>(null);
    const [cursorContext, setCursorContext] = useState<CursorContext | null>(null);

    const handleGetCursorPosition = (
        value?: string,
        ref?: HTMLTextAreaElement
    ) => {
        if (!(ref ?? inputRef.current)) return;

        const textarea = ref ?? inputRef.current!;
        const caretIndex = textarea.selectionStart ?? 0;

        //Get the text in the general area 
        const val = value ?? props.value as string ?? ""
        const currentPrefix = getWordPrefix(val, caretIndex)
        const currentSuffix = getWordSuffix(val, textarea.selectionStart)

        //Does the current word contain the prefix?
        const autocomplete = data.find(a => currentPrefix.includes(a.prefix))
        if (!autocomplete) {
            closeSuggestions();
            return;
        }; //If not then no

        //OK then now let's get the actual focused word
        const replacePrefix = currentPrefix.substring(currentPrefix.indexOf(autocomplete.prefix));
        const query = replacePrefix.replace(autocomplete.prefix, "")
        const replaceSuffix = autocomplete.suffix ? currentSuffix.slice(0, currentSuffix.indexOf(autocomplete.suffix)) : currentSuffix

        const suggestions = query.length < (autocomplete.minSearchLength ?? 0) ? []
            : autocomplete.data.filter(a => autocomplete.matcher?.(a, query) ?? JSON.stringify(a).includes(query));

        //OK now that we know what to do, let's save this all to our context
        setCursorContext({
            setName: autocomplete.name,
            currentPos: caretIndex,
            prefix: replacePrefix,
            suffix: replaceSuffix,
            renderer: autocomplete.renderer ?? JSON.stringify,
            suggestions: suggestions.slice(0, autocomplete.maxSuggestions ?? 7),
            value: autocomplete.value ?? JSON.stringify,
            minLength: autocomplete.minSearchLength ?? 0,
            query: query,
            total: autocomplete.data.length,
            resultsTotal: suggestions.length
        })

        summonSuggestions();

    };

    function getWordPrefix(value: string, caretIndex: number): string {
        const beforeCaret = value.slice(0, caretIndex);
        const match = beforeCaret.match(/(?:^|\s)(\S+)$/);
        return match ? match[1] : '';
    }

    function getWordSuffix(value: string, caretIndex: number): string {
        const afterCaret = value.slice(caretIndex);
        const match = afterCaret.match(/^(\S+)/);
        return match ? match[1] : '';
    }

    /**
 * Replace prefix + suffix around position `pos` with `replacement`
 */
    function replaceAround(
        value: string,
        pos: number,
        prefix: string,
        suffix: string,
        replacement: string
    ): {
        newValue: string;
        newCaretPosition: number;
    } {
        const start = pos - prefix.length;
        const end = pos + suffix.length;

        if (start < 0 || end > value.length) {
            throw new Error("Prefix/suffix out of bounds");
        }

        const newValue = value.slice(0, start) + replacement + " " + value.slice(end + 1);
        const newCaretPosition = start + replacement.length + 1;

        return { newValue, newCaretPosition };
    }

    function updateInputValueWithCaret(
        inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>,
        newValue: string,
        newCaretPosition: number,
        onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    ) {
        const el = inputRef.current;
        if (!el) return;

        // Create a synthetic change event
        const event = {
            ...new Event("change", { bubbles: true }),
            target: el,
            currentTarget: el,
        } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

        // Set value before triggering change
        el.value = newValue;

        // Fire the onChange manually
        onChange?.(event);

        // Set caret position after value is applied
        requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(newCaretPosition, newCaretPosition);
        });
    }

    const summonSuggestions = () => {
        setAnchorEl(textfieldRef.current)
    }

    const closeSuggestions = () => {
        setAnchorEl(null)
    }

    return <ClickAwayListener onClickAway={closeSuggestions}>
        <div style={{ width: "100%" }}>
            <TextField
                fullWidth
                inputRef={inputRef}
                ref={textfieldRef}

                onChange={(e) => {
                    handleGetCursorPosition((e as any).target.value)
                    props.onChange?.(e)
                }}
                onClick={(e) => {
                    handleGetCursorPosition();
                    props.onClick?.(e)
                }}
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown" && menuListRef.current) {
                        e.preventDefault(); // Prevent cursor from moving in the input
                        menuListRef.current.focus();
                    } else { props.onKeyDown?.(e) }

                }}
                onKeyUp={(e) => {
                    if ([
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "Home",
                        "End",
                        "PageUp",
                        "PageDown",
                    ].includes(e.key)) { handleGetCursorPosition(); }
                    if (e.key === "Escape") { closeSuggestions() }

                    props.onKeyUp?.(e)
                }}
                multiline
                {...(() => {
                    const { onChange, onClick, onKeyDown, onKeyUp, multiline, ...rest } = props;
                    return rest;
                })()}
            />
            {anchorEl && (
                <Popper
                    open
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    modifiers={[
                        {
                            name: 'sameWidth',
                            enabled: true,
                            phase: 'beforeWrite',
                            requires: ['computeStyles'],
                            fn({ state }) {
                                state.styles.popper.width = `${state.rects.reference.width}px`;
                            },
                        },
                    ]}
                    style={{ zIndex: autocompleteZIndex ?? "2000" }}
                >
                    <Paper>
                        <MenuList id="split-button-menu"
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    requestAnimationFrame(() => {
                                        inputRef?.current?.focus()
                                        inputRef?.current?.setSelectionRange(cursorContext?.currentPos ?? 0, cursorContext?.currentPos ?? 0);
                                    });
                                }
                            }}
                        >
                            <div style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "5px" }}>
                                <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "flex-end" }}>
                                    <b>{cursorContext?.setName}</b>
                                    <div style={{ display: 'flex', gap: "5px", alignItems: 'center' }}>
                                        {cursorContext?.resultsTotal} result(s)
                                        <IconButton onClick={() => closeSuggestions()} size="small"><Close fontSize="inherit" /></IconButton>
                                    </div>

                                </div>
                                <hr />
                            </div>

                            {cursorContext && <>
                                {cursorContext.suggestions.length === 0 && <ListItem style={{ opacity: ".7" }}>
                                    No suggestions
                                </ListItem>}

                                {cursorContext.query.length < cursorContext.minLength && <ListItem style={{ opacity: ".7" }}>
                                    Type at least {cursorContext.minLength} characters
                                </ListItem>}

                                {(cursorContext?.suggestions?.length ?? 0) > 0 && <MenuItem ref={menuListRef}
                                    key={`suggestions-first`} onClick={() => {
                                        closeSuggestions();
                                        const { newCaretPosition, newValue } = replaceAround(props.value as string ?? "",
                                            cursorContext?.currentPos, cursorContext.prefix, cursorContext.suffix,
                                            cursorContext.value(cursorContext.suggestions[0])
                                        )
                                        updateInputValueWithCaret(inputRef, newValue, newCaretPosition, props.onChange)
                                    }} >
                                    <div style={{ overflow: 'hidden', paddingRight: "20px" }}>
                                        {cursorContext.renderer(cursorContext.suggestions[0])}
                                    </div>
                                </MenuItem>}

                                {cursorContext?.suggestions.slice(1).map(s =>
                                    <MenuItem key={`suggestion-${JSON.stringify(s)}`} onClick={() => {
                                        closeSuggestions();
                                        const { newCaretPosition, newValue } = replaceAround(props.value as string ?? "",
                                            cursorContext.currentPos, cursorContext.prefix, cursorContext.suffix,
                                            cursorContext.value(s)
                                        )
                                        updateInputValueWithCaret(inputRef, newValue, newCaretPosition, props.onChange)
                                    }}>
                                        <div style={{ overflow: 'hidden', paddingRight: "20px" }}>
                                            {cursorContext.renderer(s)}
                                        </div>
                                    </MenuItem>
                                )}
                            </>}

                        </MenuList>
                    </Paper>

                </Popper>
            )}
        </div>
    </ClickAwayListener>

}

