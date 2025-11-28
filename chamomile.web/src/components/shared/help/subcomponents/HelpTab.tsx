import HelpDisplay from "./helpDisplay/HelpDisplay";
import HelpSection from "./helpDisplay/HelpSection";
import GithubLink from "../../githubLink/GithubLink";
import { Alert, AlertTitle, Button, Card, CardContent, CircularProgress, IconButton, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import { ArrowForward, AutoFixHigh, BarChart, Bolt, BorderClear, CalendarMonth, Coffee, CoffeeOutlined, CopyAll, DirectionsRun, Download, ExpandMore, Explore, Folder, Gradient, GridView, HomeRepairService, Image, ImageSearch, LibraryAdd, Menu, ModelTraining, Monitor, MoreVert, OpenWith, Palette, Pause, PhotoLibrary, PlayArrow, ReceiptLong, Refresh, Schedule, Settings, Star, ThumbDown, Timeline, Tune, Upload, Warning, Window, Yard } from "@mui/icons-material";
import { usePrompt } from "../../../hooks/usePrompt";
import { ReactNode } from "react";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import AdvSearchHelp from "../../filter/AdvSearchHelp";
import HighlightedPromptDiv from "../../prompt/HighlightedPromptDiv";

export default function HelpTab(props: {
    setOpen: (val: boolean) => void
    height: string
}) {

    const { setOpen } = props;
    const codeStyle = { background: "#222", padding: "5px", fontFamily: "monospace" };
    const highlightedCodeStyle = { ...codeStyle, fontSize: "1em" }
    const { setPrompt, prompt } = usePrompt();
    const { width } = useWindowDimensions();

    const writePrompt = (val: string) => {
        setOpen(false)
        setPrompt({
            ...prompt,
            positivePrompt: val,
            negativePrompt: "",
            width: 1024,
            height: 1024,
            steps: 30
        })
    }

    const keyCombo = (keys: string[]) => {
        return <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
            {keys.map((a, i) => {
                return <>
                    <span style={{ ...codeStyle, padding: "0px 10px" }}>{a}</span>
                    {i !== keys.length - 1 && <span style={{ padding: "0px 5px" }}>+</span>}
                </>
            })}
        </span>
    }
    const BrewButton = <Button variant="contained" style={{ transform: "scale(.8)" }}>Brew</Button>
    const LabeledIcon = (props: {
        children: ReactNode,
        label: string
    }) => <span style={{
        display: "inline-flex", alignItems: "center", verticalAlign: 'middle',
        gap: "10px", background: "rgba(0,0,0,0.5)",
        padding: "2px 4px", borderRadius: "5px", fontSize: ".8em"
    }}>
            {props.children} {props.label}
        </span>

    const samplePrompt = "man made of blue slime, slime man, slime, melting, liquid hair, ((furry)), dog, canine, anthro, twink, chubby, blue skin, transparent skin, translucent skin, polo, sweatpants, waving, looking at viewer, smile"

    return <HelpDisplay height={props.height} tabsWidth={200}>

        <HelpSection title="Welcome to Chamomile" >
            <p>
                Welcome to Chamomile! We hope that Chamomile helps you easily generate more images from Stable Diffusion,
                as well as manage and browse your collection.
            </p>
            <p>Click on a section on the left to learn more about Chamomile's features</p>
            <div style={{ marginTop: '50px' }}>
                <p>Please report any bugs you find to our <GithubLink href="https://github.com/GooeyAvocado/Chamomile">Github!</GithubLink> </p>
            </div>
        </HelpSection>

        <HelpSection title="Setting up Stable Diffusion" >
            <p>
                Chamomile is a wrapper for an A1111 or equivalent Stable Diffusion web UI. That means that if you've set up
                the docker container for this app, you're only really halfway there if you're starting from scratch.
                If you don't have one of these already set up on your computer, consider downloading one from the list below:
            </p>
            <ul>
                <li>
                    <GithubLink href="https://github.com/Panchovix/stable-diffusion-webui-reForge">
                        Reforge (Recommended)
                    </GithubLink>
                </li>
                <li>
                    <GithubLink href="https://github.com/lllyasviel/stable-diffusion-webui-forge">
                        Forge
                    </GithubLink>
                </li>
                <li>
                    <GithubLink href="https://github.com/AUTOMATIC1111/stable-diffusion-webui">
                        Automatic1111
                    </GithubLink>
                </li>
            </ul>
            <p>
                Once you've installed your web UI, start it up and make sure you're able to generate an image.
                You can later import it to Chamomile.
            </p>
            <p>
                Once you've got a working Stable Diffusion web UI, you'll need to enable the API. You can do this by adding <span style={codeStyle}>
                    --api
                </span> to your <span style={codeStyle}>
                    COMMANDLINE_ARGS
                </span> on <span style={codeStyle}>
                    webui-user.bat
                </span>. If you have your web ui running, restart it so this argument takes effect.
            </p>
            <p>If you've completed this set up successfully, refresh Chamomile,
                and your {BrewButton} button should now be enabled!</p>
        </HelpSection>

        <HelpSection title="Importing Your Existing Collection" >
            <img src="/screenshots/filedrop.png" style={{ width: "100%" }} />
            <p>
                If you've previously generated images with your web UI, you can import them into Chamomile by dragging and dropping one or
                more files or folders. We'll take care of extracting the metadata already embedded on each image to populate
                prompt, checkpoint, LoRAs, sampler, seed, and other information.
            </p>
        </HelpSection>

        <HelpSection title="Generating Your First Images" >
            <p>
                If your {BrewButton} button is enabled, you should be able to start generating images.
                Try generating this prompt:
            </p>
            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                <div style={{ ...codeStyle, padding: "20px", flex: '1', display: "flex", gap: "10px", alignItems: 'start' }}>
                    <Tooltip title="Use this prompt">
                        <IconButton onClick={() => writePrompt(samplePrompt)}>
                            <ReceiptLong />
                        </IconButton>
                    </Tooltip>
                    <div>
                        {samplePrompt}
                    </div>
                </div>
                <img src="/images/wave.png" style={{ width: "25%" }} />
            </div>
            <div>
                <i>Hint: Press the order icon to load this prompt to your prompt box and close this window</i>
            </div>

            <div style={{ marginTop: "20px" }}>
                By default, Chamomile places 3 images in the queue when you hit {BrewButton}, but you can modify
                this easily. Simply click on the <LabeledIcon label="More Options"> <ExpandMore /></LabeledIcon> button
                on the prompt box and set your <LabeledIcon label="Amount"><Coffee /></LabeledIcon> of images up or down.
                You can also change this default in the <LabeledIcon label="Settings"><Settings /></LabeledIcon> drawer
                accessible through the menu on the top left of the screen.
            </div>
        </HelpSection>

        <HelpSection title="System Status" >
            <img src="/screenshots/statusbutton.png" />
            <p>
                You may have noticed a play button on the top right of the screen change to two circular progress bars
                when you brew images. This button allows you to view and change the current system status. Chamomile
                can be in a few states including:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <div>
                    <b><LabeledIcon label="Ready"><PlayArrow color="success" /></LabeledIcon></b>: Ready to generate images
                </div>
                <div style={{ display: "flex" }}>
                    <b style={{ marginRight: "5px" }}><LabeledIcon label="Busy:">
                        <div style={{ position: "relative", width: "24px", height: "24px" }}>
                            <CircularProgress size={24} value={75} variant="determinate" style={{ position: "absolute", top: "0", left: "0" }} color="warning" />
                            <CircularProgress size={20} value={50} variant="determinate" style={{ position: "absolute", top: "2px", left: "2px" }} />
                            <div style={{ fontSize: ".65em", fontWeight: "normal", position: "absolute", width: "24px", textAlign: "center", top: "6px" }}>{5}</div>
                        </div>
                    </LabeledIcon></b>The system is currently busy. The inner circle is
                    current image progress, and the outer circle is the overall progress.
                    The number in the center is the number of images still on queue (up to 99).
                </div>
                <div>
                    <b><LabeledIcon label="Paused"><Pause color="warning" /></LabeledIcon></b>: Generation is paused, and no job is currently active
                </div>
                <div style={{ display: 'flex', gap: "5px" }}>
                    <div style={{ flexShrink: "0" }}><b><LabeledIcon label="SD Unavailable"><Warning color="warning" /></LabeledIcon></b>: </div>
                    <div>Chamomile
                        was unable to contact your web UI, and is unable to brew any images.</div>
                </div>
            </div>
            <p>
                If SD is unavailable, an additional option on this menu will appear to refresh SD status. Generation will be paused if an image fails
                to generate because SD went down. The image that failed to generate will be re-added to the queue
                in the first position so it's generated as soon as SD becomes available and generation is resumed.
            </p>

        </HelpSection>

        <HelpSection title="Using Different Checkpoints and LoRAs" >
            <img src="/screenshots/models.png" style={{ width: "70%" }} />
            <p>
                One of the basic ways to generate different images beyond prompting differently is to use different checkpoints and low-rank
                adaptations (LoRAs) on top of said checkpoints. Chamomile makes it easy to select your checkpoint and add or remove LoRAs to your
                prompt. Click on the <LabeledIcon label="Models"><ModelTraining /></LabeledIcon> button on the prompt box.
            </p>
            <Alert severity="warning" style={{ fontSize: ".8em" }}>
                <AlertTitle style={{ fontSize: "1.2em" }}>New checkpoints and LoRAs may not automatically be visible</AlertTitle>
                Open the checkpoint or LoRA Browsers using the <LabeledIcon label="Browser"> <GridView /></LabeledIcon> button and click
                the <LabeledIcon label="Refresh"><Refresh /></LabeledIcon> button on the upper left corner.
            </Alert>
            <p>
                Checkpoints can only be set globally, and will affect pending generations. If you change your checkpoint while there's still
                prompts pending, they will be generated using the new checkpoint. Checkpoints are pulled from your web UI and should be downloaded
                to the following directory: <div style={codeStyle}>/(your web UI root)/models/stable-diffusion</div>
            </p>
            <p>
                LoRAs can be set on an individual prompt level, and will appear on your prompt between greater than and less than signs.
                (IE: <span style={codeStyle}>{"<lora:MyLora:1>"}</span>). That "1" at the end is the weight. Different LoRAs have different
                recommended, minimum, and maximum weights which you should check when you download them. LoRAs are also pulled from your
                web UI and should be downloaded to the following directory: <div style={codeStyle}>/(your web UI root)/models/lora</div>
            </p>
            <p>
                Hint: If your images come out looking like a garbled mess of colors, you may have too many LoRAs, or the weights of one or
                more of your LoRAs may be too high. Try adjusting or removing unnecessary LoRAs and see if that helps.
            </p>
            <p>You can download additional models from several sources, but we recommend <Link href="https://civitai.com/">CivitAI</Link></p>
        </HelpSection>

        <HelpSection title="Checkpoint Sequencing" >
            <img src="/screenshots/modelsequence.png" style={{ width: "70%" }} />
            <p>
                If you have a large batch of images on queue, and want to introduce further variety in your
                outputs, you can consider setting up a checkpoint sequence. You can do this by clicking the
                <LabeledIcon label="Sequence"> <Schedule /></LabeledIcon> button next to the edit checkpoint button.
                Based on the sequence, Chamomile will dynamically switch checkpoints after generation of an image.
            </p>
            <p>
                Each entry in the sequence has two properties:
            </p>
            <ul>
                <li>
                    <b>Chance to stay</b>:
                    Percentage chance that Chamomile will stay on this checkpoint rather than switch to
                    another checkpoint in the sequence. Setting this value too low may cause Chamomile to
                    thrash between checkpoints.<br /><br />
                </li>
                <li>
                    <b>Load weight</b>:
                    How likely this checkpoint is to be chosen when switching checkpoints. A higher load weight
                    means this checkpoint will be picked more often compared to others in the sequence.
                    Chamomile will not pick the same checkpoint it just switched from.
                </li>
            </ul>
        </HelpSection>

        <HelpSection title="Model Management" >
            <img src="/screenshots/modelEdit.png" width={"50%"} />
            <p>
                As part of adding models to Chamomile, you should also take the time to set your model type, a sample image, and some notes.
                Your LoRA can also store activation tags, though these are purely for notes (for now).
            </p>
            <p>
                Models can now also have tags associated to them to help organize them better. You can set an unlimited number of tags,
                but the models will be grouped by their first tag when browsing (their primary tag), and have two additional tags shown
                on their tile if present.
            </p>
            <p>
                You can also set a sample image from the image viewer. Simply click the <LabeledIcon label="Menu button"><MoreVert /></LabeledIcon>
                {" "}on the LoRA or Checkpoint card, and select <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Set this as sample image</Card>
            </p>
        </HelpSection>

        <HelpSection title="Dynamics">
            <img src="/screenshots/wildcards.png" width={"100%"} />
            <p>
                Dynamics encompass ways to make your prompt more flexible and reusable without altering your base
                prompt. These can all be specified and managed from
                the <LabeledIcon label="Dynamics"> <AutoFixHigh /></LabeledIcon> button on the prompt box.
                These include three main systems: Wildcards, Overrides, and Templates.
            </p>
            <ul>
                <li>
                    <b>Wildcards</b>: Wildcards allow you to specify a placeholder in your prompt that will be replaced at
                    generation time by Dynamic Prompts. The Dynamics dialog allows you to select a specific value for that
                    wildcard instead.<br /><br />
                </li>
                <li>
                    <b>Overrides</b>: Overrides allow you to specify search and replace rules that will be applied.<br /><br />
                </li>
                <li>
                    <b>Templates</b>: Templates allow you to create reusable, parametrized chunks of prompts.
                </li>
            </ul>
            <p>
                Dynamics are applied in the following order at generation time:
            </p>
            <img src="/screenshots/orderOfOperationsCondensed.png" width={"100%"} />
            <hr />
            <p>
                Wildcards and template parameter values are saved on your prompt. Pre-selected wildcard values and
                overrides are global and will be applied to any prompt you generate (written or saved) on the
                Chamomile tab they're set on. These can also be exported and imported.
            </p>
            <p>
                Overrides, and wildcard presets run until no instances of them exist in the prompt to generate,
                or until there's been 10 iterations of replacing for each, whichever comes first. This means you can add
                overrides on top of overrides, or wildcard presets for wildcards called on another selected wildcard preset
            </p>
            <p>
                Chamomile will save both the actual prompt used by your web UI to generate the image, named the "Prompt",
                and the prompt with templates, wildcards, and overrides un-replaced, and comments un-removed, named the
                "Base Prompt", so you can re-use a base prompt from any generated image.
            </p>


        </HelpSection>

        <HelpSection title="Using Wildcards" >
            <img src="/screenshots/wildcards.png" width={"100%"} />
            <p>
                Chamomile works with Dynamic Prompts and our Wildcard Browser extension. You can install them quickly by
                downloading the github's contents into individual folders under the following directory:
            </p>
            <div style={codeStyle}>/(your web UI root)/extensions</div>
            <p>You can download both here. Make sure to restart your web UI after installing them.</p>
            <ul>
                <li><GithubLink href="https://github.com/adieyal/sd-dynamic-prompts/tree/main">Dynamic Prompts</GithubLink></li>
                <li><GithubLink href="https://github.com/GooeyAvocado/sd-wildcard-browser">Wildcard Browser</GithubLink></li>
            </ul>
            <p>
                With Dynamic Prompts, you can add wildcards to your prompt, where one value will be picked from
                a given text file. You can specify where the wildcard will be placed by using two underscores (IE: __body_types__).
                Wildcard values can contain other wildcards, LoRAs, or other Dynamic Prompt syntax.
                Your text files for wildcards should be placed here:
            </p>
            <div style={codeStyle}>/(your web UI root)/extensions/sd-dynamic-prompts/wildcards</div>
            <p>
                With the Wildcard Browser extension, Chamomile will be able to look into those wildcards to allow you
                to add, and pre-select values in your prompt. This is accessible from
                the <LabeledIcon label="Dynamics"> <AutoFixHigh /></LabeledIcon> button on the prompt box.
            </p>
            <p>
                Dynamic Prompts have a very rich syntax and feature set that you can learn more about in
                their <Link href="https://github.com/adieyal/sd-dynamic-prompts/blob/main/docs/SYNTAX.md">documentation</Link>.
            </p>
        </HelpSection>

        <HelpSection title="What are Overrides" >
            <img src="/screenshots/overrides.png" style={{ width: "100%" }} />
            <p>
                Along with wildcards, Chamomile supports two other ways to alter a prompt at generation time. This is
                accessible from the <LabeledIcon label="Dynamics"> <AutoFixHigh /></LabeledIcon> button
                on the prompt box.
            </p>
            <h2 style={{ fontFamily: 'Merriweather' }}>Overrides</h2>
            <p>
                Overrides serve as a simple search and replace for prompts. It's mostly useful in case you want to
                replace a call to a specific LoRA (say a PonyXL LoRA for an Illustrious equivalent), or replacing more
                complex Dynamic Prompt syntax, without altering the base prompt or needing to individually edit existing
                saved recipes.
            </p>
            <h2 style={{ fontFamily: 'Merriweather' }}>Variables (Deprecated)</h2>
            <p>
                Variables were originally implemented as part of Chamomile 1.0. These are defined in your prompt
                between percent symbols (IE: %myVar%), and can have multiple values separated by the pipe symbol which are then
                used sequentially when queuing. IE: If your variable is set to "red|blue|green" and you queue 3 images to generate,
                the first would fill the value as "red", the second with "blue", and the third with "green".
            </p>
            <p>
                This system is now deprecated, because Dynamic Prompts has an existing and more robust variable system.
            </p>
        </HelpSection>

        <HelpSection title="Templates" >
            <img src="/screenshots/templates.png" style={{ width: "100%" }} />
            <p>
                Templates are a new way to create reusable, parametrized chunks of prompts. These can be centrally managed
                and easily inserted into any saved or written prompt.
            </p>
            <p>
                Templates can be called later like a function in any prompt:
            </p>
            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={codeStyle}>
                        [googgo:<b style={{ backgroundColor: "#3F0000", padding: "2px 10px" }}>red</b>]
                    </div>
                </div>
                <div>
                    <ArrowForward />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ ...codeStyle, fontSize: ".8em" }}>
                        man made of <b style={{ backgroundColor: "#3F0000", padding: "2px 10px" }}>red</b> slime,
                        slime man, slime, melting, liquid hair, ((furry)), dog, canine, anthro, twink,
                        chubby, <b style={{ backgroundColor: "#3F0000", padding: "2px 10px" }}>red</b> skin,
                        transparent skin, translucent skin, polo, sweatpants, __facial_expresions__, waving
                    </div>
                </div>
            </div>

            <p>
                Parameters are separated by tildes (~), are optional, and can have default values set in
                the template definition:
            </p>

            <div style={{ display: 'flex', gap: "10px", alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ ...codeStyle, fontSize: ".9em" }}>
                        [googgo:<b style={{ backgroundColor: "#3F0000", padding: "2px 10px" }}>
                            red
                        </b>~~~<b style={{ backgroundColor: "#00003F", padding: "2px 10px" }}>
                            hoodie, jeans
                        </b>]
                    </div>
                </div>
                <div>
                    <ArrowForward />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ ...codeStyle, fontSize: ".8em" }}>
                        man made of <b style={{ backgroundColor: "#3F0000", padding: "2px 10px" }}>red</b> slime,
                        slime man, slime, melting, liquid hair, ((furry)), dog, canine, anthro, twink,
                        chubby, <b style={{ backgroundColor: "#3F0000", padding: "2px 10px" }}>red</b> skin,
                        transparent skin, translucent skin, <b style={{ backgroundColor: "#00003F", padding: "2px 10px" }}>
                            hoodie, jeans
                        </b>, __facial_expresions__, waving
                    </div>
                </div>
            </div>
            <p>
                You can access the template call builder and manager from
                the <LabeledIcon label="Dynamics"> <AutoFixHigh /></LabeledIcon> button
                on the prompt box.
            </p>
        </HelpSection>

        <HelpSection title="Defining a Template" >
            <img src="/screenshots/templateEditor.png" width={"60%"} />
            <p>
                Templates can be defined from the Template Manager, accessible from
                the <LabeledIcon label="Manage templates"> <HomeRepairService /></LabeledIcon> button on
                the templates section of the Dynamics modal accessible through
                the <LabeledIcon label="Dynamics"> <AutoFixHigh /></LabeledIcon> button
                on the prompt box.
            </p>
            <p>
                Templates have several properties:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>
                    <b>Name:</b> A unique name for this template. This is what you'll use to call it later
                </div>
                <div>
                    <b>Description:</b> a short description on this template that will be shown on the template manager
                </div>
                <div>
                    <b>Parameters:</b> A list of parameter names and a default value. Each parameter is numbered,
                    which is how Chamomile identifies where to replace them in the template string.
                </div>
                <div>
                    <b>Template String:</b> The actual prompt chunk that will be inserted when calling this template.
                    Use a tilde and a number to indicate where each parameter should be placed. IE: ~1 for your
                    first parameter.
                </div>
            </div>

        </HelpSection>

        <HelpSection title="Comments on Prompts">
            <p>
                Chamomile lets you write comments on your prompts in a few ways. This is useful especially if you want to disable certain
                parts of a prompt, or leave some notes and structure for later. Comments are removed at generation time, so your web UI will
                never see them. However, they are preserved on the Base Prompt, so you can see them later.
            </p>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Format</TableCell>
                        <TableCell>Sample</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>#This entire line is commented</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>//</TableCell>
                        <TableCell>//This entire line is also commented</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>/**/</TableCell>
                        <TableCell>This section isn't commented /*but this one is*/</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </HelpSection>

        <HelpSection title="Advanced Prompting Techniques" >
            <img src="/screenshots/expandedPromptBar.png" width={"100%"} />
            Chamomile allows you to fine tune your results with more than just a prompt and models.
            Clicking the <LabeledIcon label="More Options"> <ExpandMore /></LabeledIcon> button on the prompt bar reveals
            additional settings for your prompts including:

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>

                <div>
                    <b><LabeledIcon label="Negative Prompt"><ThumbDown /></LabeledIcon></b>: What the diffusion checkpoint should avoid
                </div>

                <div style={{ display: 'flex', gap: "5px" }}>
                    <div style={{ flexShrink: "0" }}>
                        <b><LabeledIcon label="Dimensions"><OpenWith /></LabeledIcon></b>:
                    </div>
                    <div>
                        <div>Determines the dimensions of your image.</div>
                        <div style={{ fontSize: ".9em", opacity: ".8" }}>
                            <i>Clicking the icon on this component will bring up a dialog with common size presets</i>
                        </div>
                    </div>
                </div>

                <div>
                    <b><LabeledIcon label="Sampler"><Window /></LabeledIcon></b>: Determines the algorithm used to generate your image.
                    <img src="/images/charts/sampler.png" width={"100%"} style={{ marginTop: "10px" }} />
                    <p>
                        Think of the sampler like choosing a tea brewing method (steeping, cold brew, etc). Each method
                        draws out flavors differently, resulting in unique aromas and textures. Similarly, different
                        samplers can produce subtle or dramatic changes in your image's style, detail, and consistency.
                    </p>
                    <p>
                        While we display all available samplers, 4 have been chosen as the most common and are displayed on top:
                    </p>
                    <div style={{ display: "flex", flexDirection: 'column', gap: "10px", marginLeft: "20px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <Bolt />
                            <div style={{ flexShrink: "0", width: "70px" }}>
                                <b>Fast</b>
                                <div style={{ fontSize: ".8em", opacity: ".8" }}> (UniPC)</div>
                            </div>:
                            <div>
                                The newest sampler which can generate images in fewer steps
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <Palette />
                            <div style={{ flexShrink: "0", width: "70px" }}>
                                <b>Styled</b>
                                <div style={{ fontSize: ".8em", opacity: ".8" }}>(Euler Dy)</div>
                            </div>:
                            <div>
                                Often resolves to simpler images giving a more cartoony or stylized look
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <Explore />
                            <div style={{ flexShrink: "0", width: "70px" }}>
                                <b>Standard</b>
                                <div style={{ fontSize: ".8em", opacity: ".8" }}>(DPM++ 2M)</div>
                            </div>:
                            <div>
                                Provides a balance of quality and speed
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <Image />
                            <div style={{ flexShrink: "0", width: "70px" }}>
                                <b>Quality</b>
                                <div style={{ fontSize: ".8em", opacity: ".8" }}>(DPM2)</div>
                            </div>:
                            <div>
                                Slower but resolves to higher quality, sharper images
                            </div>
                        </div>

                    </div>
                </div>


                <div>
                    <b><LabeledIcon label="Steps"><DirectionsRun /></LabeledIcon></b>: Amount of iterations the diffusion model should run for.
                    <img src="/images/charts/steps.png" width={"100%"} style={{ marginTop: "10px" }} />
                    <p>
                        Think of this as how long your image will "brew" for. Fewer steps are like a quick tea brew:
                        faster, but with less depth and subtlety. More steps allow for richer, more refined images,
                        but take longer to generate. However, just like over-brewing tea, increasing steps beyond a
                        certain point won't improve quality and may even waste time, as image improvements eventually plateau.
                    </p>
                    <p>10 steps or less are usually too un-detailed, while more than 30 usually nets no benefit in quality</p>
                </div>

                <div>
                    <b><LabeledIcon label="CFG Scale"><Tune /></LabeledIcon></b>: Controls how strictly the model follows your prompt.
                    <img src="/images/charts/cfg.png" width={"100%"} style={{ marginTop: '10px' }} />
                    <p>
                        Think of this like adjusting the tea-to-water ratio when brewing tea. A higher CFG Scale is like using more tea leaves for a stronger,
                        more defined flavor (closer to your prompt), while a lower CFG Scale is like using fewer leaves for a milder, more subtle result
                        (more creative freedom for the model).
                    </p>
                    <p>
                        You can add too much water and then there's no taste (no image), and you can add too many tea leaves and then it's
                        too bitter (too much image). Staying around 2.0 to 7.0 is usually good enough for most models.
                    </p>
                </div>

                {/* This is left here in case we ever want to bring this back */}
                {/* <div>
                    <b><LabeledIcon label="Scheduler"><Schedule /></LabeledIcon></b>: Controls the schedule or timing of how noise is added and 
                    removed during the image generation process.
                    <p>
                        Think of the scheduler like setting a timer or schedule for brewing tea. Different timing strategies can affect 
                        how flavors develop and blend. Similarly, different schedulers influence how the image evolves step by step, impacting 
                        the final look and feel.
                    </p>
                    <p><i>Most users can stick with the default scheduler for their sampler, but experimenting with others can sometimes yield 
                        different artistic results or improve consistency for certain models.</i></p>
                </div> */}

                <div>
                    <b><LabeledIcon label="Seed"><Yard /></LabeledIcon></b>: Seed to generate the initial noise of the image
                    <p>
                        Not all tea leaves are the same, and neither is the noise that's used to start generation. Set this to a specific value
                        if you want to adjust a prompt with finer tweaks and subtler differences between generations.
                    </p>
                    <p>
                        Clicking the seed icon on this box will generate a new random seed. Setting this value to -1 will use a random seed.
                    </p>
                    <p>
                        Your seed value is also used to select wildcards. Prompts with the same seed will always choose the same wildcard value!
                    </p>

                </div>

                <div>
                    <b><LabeledIcon label="Amount"><Coffee /></LabeledIcon></b>: Amount of images to enqueue when you hit {BrewButton}
                </div>

                <hr style={{ width: "100%" }} />

                <div >Most of these have defaults that are configurable in the <LabeledIcon label="Settings"><Settings /></LabeledIcon> drawer</div>

                <p><i>
                    If you wish to experiment further without saving each image,
                    you can use the <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Preview Recipe</Card> option in
                    the {BrewButton} button's menu
                </i></p>

            </div>
        </HelpSection>

        <HelpSection title="Settings" >
            <img src="/screenshots/settings.png" width={"50%"} />
            <p>
                There's a few configurable items for the Chamomile UI that you can set:
            </p>
            <ul>
                <li><b>Sound:</b> Chamomile makes a few sounds. Do you want to hear them?</li>
                <li><b>Defaults:</b> Set the defaults for some of the advanced prompting values.</li>
                <li>
                    <b>Globals:</b> When you re-brew a recipe or existing image, all
                    prompt parameters from the source are used. You can configure Chamomile to use
                    the value you've set in the prompt box rather than the value from the source.
                </li>
            </ul>
        </HelpSection>

        <HelpSection title="Previewing Recipes">
            <img src="/screenshots/preview.png" width={"70%"} />
            <p>
                Sometimes you may want to experiment without necessarily saving a bunch of images to get there
                on Chamomile. You can use
                the <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Preview Recipe</Card> option
                in the {BrewButton} button's menu to launch the preview dialog.
            </p>
            <p>
                You can edit the prompt and the image preview on the top will update a few seconds
                after your last edit. By default, previews are generated at 10 steps instead of 30
                to make their generation faster. It may take a bit if Chamomile has a queue and is busy.
                <LabeledIcon label="Pausing"><Pause color="warning" /></LabeledIcon> generation will not pause preview brewing.
            </p>
            <p>
                The preview dialog will also generate using the same seed to make sure only
                your changes to your prompt affect the preview. You can re-roll your seed by clicking
                on the <LabeledIcon label="Seed"><Yard /></LabeledIcon> button on the lower left.
            </p>
            <p>
                When you're satisfied, you can hit
                the <Button variant="contained" style={{ transform: "scale(.8)" }}>Use Recipe</Button> to
                load the recipe you've previewed to the main prompt box. Or you
                can <Button color="secondary" style={{ transform: "scale(.8)" }}>Discard</Button> the prompt
                to close the dialog.
            </p>

        </HelpSection>

        <HelpSection title="Prompts vs Base Prompts" >
            <img src="screenshots/imageContextMenu.png" width={"60%"} />
            <p>
                When you right click on an image, you may be confused by seeing two options relating to the image's prompt.
            </p>
            <p>
                Chamomile will save both the actual prompt used by your web UI to generate the image, named the "Prompt",
                and the prompt with templates, wildcards, comments, and overrides un-replaced, named the "Base Prompt",
                so you can re-use a base prompt from any generated image.
            </p>
            <div style={{ display: 'flex', flexWrap: "wrap", gap: "20px" }}>
                <Card style={{ minWidth: width < 400 ? "0px" : "400px", flex: "1" }}>
                    <CardContent>
                        <LabeledIcon label="Prompt"><Coffee /></LabeledIcon>
                        <div style={codeStyle}>
                            man made of blue slime, slime man, slime, melting,
                            liquid hair, <b>((furry)), dog, canine, anthro</b>, blue
                            skin, <b>twink, chubby</b>, transparent skin, translucent
                            skin, polo, sweatpants, waving, looking at viewer,
                            smile
                        </div>
                    </CardContent>
                </Card>
                <Card style={{ minWidth: width < 400 ? "0px" : "400px", flex: "1" }}>
                    <CardContent>
                        <LabeledIcon label="Base Prompt"><CoffeeOutlined /></LabeledIcon>
                        <HighlightedPromptDiv
                            style={highlightedCodeStyle}
                            prompt={`# The Googgo
man made of blue slime, slime man, slime, melting, liquid hair, __species__, blue skin, __body_types__, transparent skin, translucent skin, polo, sweatpants, waving, looking at viewer, smile`} />
                    </CardContent>
                </Card>

            </div>
            <p>
                All variables, wildcard presets, and overrides persist during your time on a Chamomile tab, and when loading
                or brewing existing images or recipes.
            </p>
        </HelpSection>

        <HelpSection title="Reusing Prompts" >
            <p>
                There are a few ways to reuse prompts form images in Chamomile.
            </p>
            <p>
                Each will let you choose to
                either <LabeledIcon label="Use this prompt"><ReceiptLong /></LabeledIcon> , which will load its
                details onto the main prompt box, or
                immediately <LabeledIcon label="Brew"><Coffee /></LabeledIcon> the amount currently set on
                the prompt box.
            </p>
            <p>
                Additionally, each will let you use either the
                <LabeledIcon label="Prompt"><Coffee /></LabeledIcon>, or
                the <LabeledIcon label="Base Prompt"><CoffeeOutlined /></LabeledIcon>. The Base
                Prompt may not be available if the image was uploaded, or if the base prompt and
                actual prompt are the same.
            </p>
            <p>You can right click on an image to bring up these options:</p>
            <img src="screenshots/imageContextMenu.png" width={"60%"} />
            <p>
                You can also view these options from the image hotbar when viewing an image:
            </p>
            <img src="screenshots/imageNavGrid.png" width={"60%"} />
            <p>
                And lastly, you can view and re-use or re-order a prompt or base prompt from the side panel
                when viewing an image. Which is used depends on which prompt tab is active:
            </p>
            <img src="screenshots/imagePrompt.png" width={"60%"} />
        </HelpSection>

        <HelpSection title="Saving Recipes" >
            <img src="/screenshots/saveRecipe.png" width={"50%"} />

            <p>
                Just like an excellent tea recipe, sometimes we want to save a prompt to re-use it later. You can either favorite an image and
                find it through search, or you can specifically save a recipe. To do this, look in the menu on the {BrewButton} button, and
                click <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Save this recipe</Card> option.
            </p>
            <p>
                You can further organize your recipes into folders. Click
                the  <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle", alignItems: 'center', gap: "5px" }}>
                    <Folder fontSize="inherit" /> Root
                </Card> button to select where to save your recipe, or specify a new folder by typing a path with slashes.
            </p>
            <p>
                You can browse, edit, and load recipes using
                the <Card style={{ display: "inline-flex", padding: "5px", verticalAlign: "middle" }}>Load a recipe</Card>.
                You can also make further alterations and overwrite or save your current recipe as another name.
            </p>

        </HelpSection>

        <HelpSection title="Collections">
            <img src="/screenshots/collection.png" width={"100%"} />

            <p>
                Chamomile allows you to set up collections of images, which can automatically add images that match a custom search query. To
                view them, Click on the <LabeledIcon label="Collections"><PhotoLibrary /></LabeledIcon> icon on the menu on the top left of
                the screen.
            </p>

            <p>
                Here you can set up and view existing collections, and search images within
                your collections. <b>Important note:</b> Deleting images in a collection will
                delete the image for real!
            </p>

            <p>
                While viewing a collection, any images ordered (through re-brewing, the prompt box, or from saved recipes)
                will automatically be added to the collection. Only images to be added to the collection will be shown as
                brewing!
            </p>

            <hr />
            <img src="/screenshots/collectionsFromSearch.png" width={"100%"} />
            <p>
                You can also create collections using the searchbar on the home page. Simply type a search
                query and then click the <LabeledIcon label="Create collection from this search"><LibraryAdd /></LabeledIcon> icon.
                Chamomile will also ask you if you want to add all existing images that match the search query text to this
                new collection.
            </p>

            <p>
                Images will automatically be added to the collection if there's a search query tied
                to the collection. If you want to disable this, simply edit and untick this option. This will
                clear the search query.
            </p>

        </HelpSection>

        <HelpSection title="Grids">
            <img src="/screenshots/grid.png" width="100%" />

            <p>
                Chamomile allows you to create grids of images with different values for rows
                and columns. This makes it easy to try and compare different tweaks to the
                parameters of your prompts. Grids (unless specified) have a set seed. You can
                re-roll the seed and re-create a grid by using
                the <LabeledIcon label="Clear grid"><BorderClear /></LabeledIcon> or <LabeledIcon label="Duplicate grid"><CopyAll /></LabeledIcon> buttons.
            </p>
            <p>Columns and rows can be of the following types:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px", marginBottom: "20px" }}>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Positive or Negative Prompt"><ReceiptLong /></LabeledIcon>: </b>
                    Replace the entire positive or negative prompt on an axis
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Prompt search/replace"><ReceiptLong /></LabeledIcon>: </b>
                    Search for the first value and replace it with the value of the current cell
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="CFG Scale"><Tune /></LabeledIcon>: </b>
                    <div>CFG Scale of the image in this cell</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Seed"><Yard /></LabeledIcon>: </b>
                    <div>Seed for the cell. This overrides the grid's seed</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Dimensions"><OpenWith /></LabeledIcon>: </b>
                    <div>Dimensions of the image of a cell</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Sampler"><Window /></LabeledIcon>: </b>
                    <div>Sampler to generate the image of a cell (See Advanced Prompting)</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Checkpoint"><ModelTraining /></LabeledIcon>: </b>
                    <div>Stable Diffusion checkpoint for this cell</div>
                </div>
            </div>

            <Stack gap={"8px"}>
                <Alert severity="warning" style={{ fontSize: ".8em" }}>
                    <AlertTitle style={{ fontSize: "1.2em" }}>Do not re-use axis types</AlertTitle>
                    Aside from Prompt search/replace, you should not use two of the same axis type. Only one of the values will be used.
                </Alert>

                <Alert severity="warning" style={{ fontSize: ".8em" }}>
                    <AlertTitle style={{ fontSize: "1.2em" }}>Grids are not optimized for mobile</AlertTitle>
                    Proceed with caution if you plan to use this on a mobile or touch screen device.
                </Alert>

                <Alert severity="info" style={{ fontSize: ".8em" }}>
                    <AlertTitle style={{ fontSize: "1.2em" }}>Images from grids are hidden</AlertTitle>
                    Only images from grids that are favorites will be shown on the home page. Images from grids will always appear on collections.
                </Alert>
            </Stack>

            <hr />

            <img src="/screenshots/gridhud.png" />

            <p>
                When viewing an image on a grid, you'll see a small card on the top left of the screen showing
                where you are in the grid, your coordinates, and what the value on each axis is. The grid
                depiction on this card is always 3x3, and shows if you're on an edge, a corner, or somewhere
                in the middle of the grid.
            </p>
        </HelpSection>

        <HelpSection title="Prompt Source">
            <img src="/screenshots/promptsource.png" />
            <p>
                Images on Chamomile can come from a few different places. This accordion on the image viewer
                lets you trace back an image, it's prompt, and it's history. Images on Chamomile can have the
                following sources:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px", marginBottom: "20px" }}>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Grids"><GridView /></LabeledIcon>: </b>
                    <div>Images that come from a grid</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Image Base"><ReceiptLong /></LabeledIcon>: </b>
                    <div>Base prompt of an existing image</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Image"><ReceiptLong /></LabeledIcon>: </b>
                    <div>Full prompt of an existing image</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Prompt box"><Coffee /></LabeledIcon>: </b>
                    <div>An original, or modified existing prompt</div>
                </div>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <b style={{ flexShrink: "0" }}><LabeledIcon label="Upload"><Upload /></LabeledIcon>: </b>
                    <div>An image that was uploaded to Chamomile</div>
                </div>
            </div>

            <Alert severity="info" style={{ fontSize: ".8em" }}>
                <AlertTitle style={{ fontSize: "1.2em" }}>This is a new feature!</AlertTitle>
                This accordion will not open because Chamomile on images generated before 3.0 and you have
                not run the <Link href="https://github.com/GooeyAvocado/Chamomile/blob/master/Chamomile.Data/DDLs/ImageAddtlInfo_migration.sql" target="@blank">
                    optional migration script
                </Link>.
            </Alert>

        </HelpSection>

        <HelpSection title="More Like This">
            <img src="/screenshots/morelikethis.png" width={"80%"} />
            <p>
                Based on your prompt, source, checkpoint, and used LoRAs, you'll be able to search for more images similar to another.
                Clicking an option here will clear the filter and replace it to search by the selected criteria of similarity.
            </p>
            <p>
                If an image is the original or an upload, you can search for images that have marked the right clicked image as a sample
            </p>
            <p>
                <LabeledIcon label="More like this"><ImageSearch /></LabeledIcon> is also available on the image modal under
                the prompt, source accordion, the checkpoint card, and LoRA cards.
            </p>
        </HelpSection>

        <HelpSection title="Upscaling Images" >
            <img src="/screenshots/upscaling.png" width={"70%"} />
            <p>
                Images that have been added to Chamomile can be upscaled using your web UI. You can select which upscaler to use and
                by how much to upscale the image. The upscaled image replaces the original image.
            </p>
            <p>
                While your web UI might come bundled with several uspcalers, we personally recommend RealESRGAN models, which can
                be downloaded and placed in the following directory:
            </p>
            <div style={codeStyle}>
                /(your web UI root)/models/RealESRGAN
            </div>
        </HelpSection>

        <HelpSection title="Usage Statistics" >
            <img src="/screenshots/stats.png" style={{ width: "70%" }} />
            <p>
                You can view usage statistics by clicking
                the <LabeledIcon label="Statistics"><BarChart /></LabeledIcon> button at the end
                of the search box. These statistics are based on your search query. If it is
                blank, it'll show global overall statistics. You can further refine this to
                show only models that are available or unavailable, and limit how many
                images to analyze.
            </p>
            <p>
                You can view five different statistics:
            </p>
            <ul>
                <li><b>General:</b> A small dashboard including image counts, your most common checkpoint, LoRA, and keyword, and the date range of image generation</li>
                <li><b>Checkpoint:</b> SD Checkpoints used in generation</li>
                <li><b>LoRAs:</b> LoRAs used in generation, including a statistic for no LoRAs used</li>
                <li><b>Keywords:</b> Usage statistics on keywords* in your prompts</li>
                <li><b>Source:</b> A table showing where the prompts you've sent in are sourced form. See Prompt Source for more info</li>
            </ul>
            <div style={{ fontSize: ".8em", fontStyle: 'italic', opacity: ".8" }}>
                *Keywords are determined by splitting your prompts by commas, line breaks, or more than one
                space after having removed all LoRAs and parentheses. It's not perfect!
            </div>
            <p>
                You can also view usage statistics over time for image generation, checkpoints, LoRAs, and keywords. Simply
                click the <LabeledIcon label="Chart"><Timeline /></LabeledIcon> button on the bottom,
                and choose what elements to plot.
            </p>

            {/* <hr /> */}
            {/* <img src="/screenshots/statsgraph.png" style={{ width: "70%" }} /> */}
        </HelpSection>

        <HelpSection title="I'm Feeling Lucky">
            <img src="screenshots/lucky.png" />
            <p>
                This is a small feature that brings up a random image on Chamomile. The original intent
                was to prompt that random image immediately, but we decided against that since LoRA combinations
                and prompting can change with different active checkpoints.
            </p>
            <p>
                When an image is open, on the top left of the screen, you'll see a card with a button to roll
                the dice again, and bring up another random image. You can also hit {keyCombo(["->"])} to
                get another image.
            </p>
        </HelpSection>

        <HelpSection title="Advanced Full Text Search">
            <AdvSearchHelp />
        </HelpSection>

        <HelpSection title="Additional Search Options" >
            <img src="/screenshots/expandedSearch.png" style={{ width: "100%" }} />
            <p>
                Along with searching by text, you can go a little further by refining search criteria
                by hitting the <LabeledIcon label="More Options"> <ExpandMore /></LabeledIcon> button
                in the search box, revealing additional settings. These include:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <div>
                    <b><LabeledIcon label="Favorites"><Star htmlColor="gold" /></LabeledIcon></b>: Only show favorite images
                </div>
                <div>
                    <b><LabeledIcon label="Upscaled"><Gradient color="info" /></LabeledIcon></b>: Only show upscaled images
                </div>
                <div>
                    <b><LabeledIcon label="Downloaded"><Download color="primary" /></LabeledIcon></b>: Only show downloaded images
                </div>
                <div>
                    <b><LabeledIcon label="To and From dates"><CalendarMonth /></LabeledIcon></b>: Inclusive date ranges for search results
                </div>

                <div>
                    <b><LabeledIcon label="Checkpoints and LoRAs"><ModelTraining /></LabeledIcon></b>: Only show images that use either this checkpoint or LoRA
                </div>
            </div>

        </HelpSection>

        <HelpSection title="The Chamomile Display" >
            <img src="/screenshots/display.png" width={"100%"} />
            <p>
                The Chamomile Display is designed to keep a look at what Chamomile is generating. We generally expect this to be run on a second monitor or
                a different computer. Once an image is generated, it keeps a small buffer of images that have been generated, and you can flip through them
                on an image viewer. The image viewer will automatically pull a newly generated image if it's on the previous latest image.
            </p>
            <p>
                While it's meant for viewing only, you can still hit the <LabeledIcon label="Menu"><Menu /></LabeledIcon> button on the top right of the
                screen to bring up more information, and to brew more of the image based on their prompt or base prompt.
            </p>
            <p>The Chamomile Display can be launched from the <LabeledIcon label="Display"><Monitor /></LabeledIcon> option on the menu on the top right of the screen</p>
        </HelpSection>

        <HelpSection title="Keyboard Shortcuts">
            <h2 style={{ fontFamily: "Merriweather" }}>On the Prompt Box</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Key Combination</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "S"])}</TableCell>
                        <TableCell>Save Recipe</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "SHIFT", "S"])}</TableCell>
                        <TableCell>Save Recipe As</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "O"])}</TableCell>
                        <TableCell>Load Recipe</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "ENTER"])}</TableCell>
                        <TableCell>
                            Hits the {BrewButton} button
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <h2 style={{ fontFamily: "Merriweather" }}>On the Image Viewer</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Key Combination</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "S"])}</TableCell>
                        <TableCell>Save Image</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["CTRL", "D"])}</TableCell>
                        <TableCell>Toggle Image Favorite</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["DEL"])}</TableCell>
                        <TableCell>Delete Image</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["SHIFT", "DEL"])}</TableCell>
                        <TableCell>Delete Image without asking</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["<-"])}</TableCell>
                        <TableCell>
                            Previous Image
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>{keyCombo(["->"])}</TableCell>
                        <TableCell>
                            Next Image
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </HelpSection>

    </HelpDisplay >

}